/**
 * Data repository for the air quality sensors data.
 * Defines methods to update and retrieve the database documents
 * storing these data (sensorrecords collection - each sensors' data are
 * stored in the separate MongoDB document)
 */
const moment = require('moment');
const _ = require('lodash');
const get_all_sensors_records = require('../apis/get_all_sensors_records');
const get_stations_list = require('../apis/get_stations_list');
const get_all_sensors = require('../apis/get_all_sensors');
const SensorRecords = require('../models/sensor_records/sensor_records');

/**
 * Update the sensorrecords collection with new data available
 * from the GIOS API. The method fetches the info about the date
 * when records for each tracked sensors were updated from the
 * database, pulls the latest data from the API and detects:
 * 1) records for new sensors - they are stored as new documents
 * 2) records which contain data that are not in the database -
 * the new data are appended to the respective documents in the
 * database
 */
const update = async () => {
    try {
        // Getting records timestamps from database for each sensor
        let stored = await SensorRecords.find(
            {},
            {sensor_id: 1, values_updated_at: 1}
        );

        // Fetching latest data from GIOS for each sensor. Retrieved data
        // are filtered in order to contain only meaningful values. GIOS API
        // provides hourly data, but they are updated irregularly
        // throughout the whole next hour. Until then, it gives back the
        // measurement objects with null values, which are later
        // replaced by real data. Filtering allows no to clutter the
        // database with these dummy records
        let fetched = await fetch_records_from_api();
        fetched = filter_null_measurements(fetched);

        let new_records = _.differenceBy(fetched, [...stored], 'sensor_id');
        new_records = new_records.map(set_values_updated_at);
        await save(new_records);

        // the records which are not new should be checked for updates
        let possible_updates = _.differenceBy(
            fetched,
            new_records,
            'sensor_id'
        );
        possible_updates = possible_updates.filter(
            (record) => record.values[0]
        );
        possible_updates = possible_updates.map(set_values_updated_at);

        // if the latest timestamp of the sensor measurement from GIOS
        // does not match ours, we need to update the record
        let records_to_update = _.differenceWith(
            possible_updates,
            stored,
            function (a, b) {
                return (
                    _.isEqual(a.values_updated_at, b.values_updated_at) &&
                    a.sensor_id === b.sensor_id
                );
            }
        );

        await add_values(records_to_update);
    } catch (e) {
        console.log('COULD NOT UPDATE THE STATIONS DATA');
        console.log(e);
    }
};

/**
 * Get latest data for each sensor of the given station which has records
 * @param  {String}     station_id  ID of the station of interest
 *
 * @return {Number}                 Station id converted to number
 * @return {[Object]}               Objects holding values for each
 *                                  sensor: sensor_id, param, key,
 *                                  value, data
 */
const get_station_current_data = async (station_id) => {
    const current_data = await SensorRecords.aggregate([
        {$match: {station_id: Number(station_id)}},
        {$unwind: '$values'},
        {$sort: {'values.date': -1}},
        {
            $group: {
                _id: '$sensor_id',
                sensor_id: {$first: '$sensor_id'},
                param: {$first: '$param'},
                key: {$first: '$key'},
                value: {$first: '$values.value'},
                date: {$first: '$values.date'},
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);

    // the server stores data in UTC format (0 offset) for consistency
    // and responds in local time
    current_data.forEach((val, index) => {
        current_data[index].date = moment(val.date)
            .local()
            .format('DD-MM-YYYY HH:mm:ss');
    });

    return {station_id, values: current_data};
};

/**
 * Get average air quality data for the specified time period
 * for the station of interest
 * @param  {String}     station_id  ID of the station of interest
 * @param {Date}        from        Period start datetime
 * @param {Date}        to          Period end datetime
 *
 * @return {[Object]}               Objects holding average period
 *                                  data for each sensor:
 *                                  sensor_id, param, key,
 *                                  average_value
 */
const get_station_period_average = async (station_id, from, to) => {
    const period_station_average_data = await SensorRecords.aggregate([
        {$match: {station_id: station_id}},
        {$unwind: '$values'},
        {
            $match: {
                $and: [
                    {'values.date': {$gte: from}},
                    {'values.date': {$lt: to}},
                ],
            },
        },
        {
            $group: {
                _id: '$sensor_id',
                sensor_id: {$first: '$sensor_id'},
                param: {$first: '$param'},
                key: {$first: '$key'},
                daily_average: {$avg: '$values.value'},
            },
        },
        {
            $project: {
                _id: 0,
                sensor_id: 1,
                param: 1,
                key: 1,
                average_value: {$round: ['$daily_average', 5]},
            },
        },
    ]);

    return period_station_average_data;
};

/**
 * Get latest measurements for all Sensors from GIOS API
 * @return {[Object]}   Objects latest records available from GIOS
 *                      for each sensor
 */
async function fetch_records_from_api() {
    const stations = await get_stations_list();
    let sensors = await get_all_sensors(stations);
    sensors = sensors.map(format_sensor_info);

    let fetched = await get_all_sensors_records(sensors);
    return fetched;
}

/**
 * Set the timestamp on the updated object
 * @param  {Object} record   An object containing air quality records
 *                           for particular sensor
 * @return {Object}          The same object with new propertt -
 *                           values_updated_at
 */
function set_values_updated_at(record) {
    // if the record contains data, get the latest timestamp, if not -
    // use the current time. We might get new records for previously
    // not registered sensors with empty data - they should be stored
    let values_updated_at;
    if (record.values[0]) {
        values_updated_at = moment(record.values[0].date).toDate();
    } else {
        values_updated_at = moment()
            .minutes(0)
            .seconds(0)
            .milliseconds(0)
            .toDate();
    }

    record.values_updated_at = values_updated_at;
    return record;
}

/**
 * Helper method - converts the parsed object from GIOS API
 * into the object with keys matching our data model
 */
function format_sensor_info({id, stationId, param: {paramName}}) {
    return {
        sensor_id: id,
        station_id: stationId,
        param: paramName,
    };
}

/**
 * Helper method - filters out dummy records with null values
 * received from GIOS API
 */
function filter_null_measurements(records) {
    return records.map((record) => {
        record.values = record.values.filter((value) => value.value !== null);
        return record;
    });
}

/**
 * Saving the data to the sensorrecords collection in the database (new
 * entries)
 * @param {Object} records  Data object pre-formatted to match the
 *                          schema of the SensorRecords data model
 */
async function save(records) {
    records = records.map((record) => {
        return new SensorRecords(record);
    });
    const save_promises = records.map((record) => record.save());
    await Promise.all(save_promises);
}

/**
 * Updating the documents in the database
 * @param {Object} records  Data object pre-formatted to match the
 *                          schema of the SensorRecords data model
 */
async function add_values(records) {
    const promises = records.map(add_sensor_values);
    await Promise.all(promises);
}

/**
 * Appending new values to the existing documents
 * @param {Object} records  Data object pre-formatted to match the
 *                          schema of the SensorRecords data model
 */
async function add_sensor_values({sensor_id, values_updated_at, values}) {
    await SensorRecords.findOneAndUpdate(
        {sensor_id},
        {
            // so we are inserting only the measurements which did not
            // exist before
            $addToSet: {
                values: {
                    $each: values,
                },
            },
            $set: {
                values_updated_at,
            },
        },
        {new: true}
    );
}

module.exports = {
    update,
    get_station_period_average,
    get_station_current_data,
};
