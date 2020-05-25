/**
 * These functions implement the third stage of air quality data
 * fetching from GIOS - retrieving available air quality data for each
 * GIOS sensor.
 */
const config = require('config');
const rp = require('request-promise');
const process_split_requests = require('../utils/process_split_requests');

/**
 * Get the available records from GIOS for the individual sensor
 * @param {Object} sensor_info  Object containing data about the sensor
 *                              which will be used to retrieve its records
 *                              from GIOS and add necessary info before
 *                              storing it to the database
 */
async function get_sensor_records(sensor_info) {
    const records_uri = config.get('records_uri');
    const {sensor_id, param, station_id} = sensor_info;
    try {
        const records = await rp({
            uri: records_uri + sensor_id,
            json: true,
        });
        records.sensor_id = sensor_id;
        records.param = param;
        records.station_id = station_id;
        return records;
    } catch (e) {
        console.log('COULD NOT GET ONE SENSOR RECORDS');
        throw new Error('COULD NOT GET ONE SENSOR RECORDS');
    }
}

/**
 * Get all air quality records for all sensors available from GIOS
 * @param  {[Object]} sensors_list   Objects storing parameters of the
 *                                   sensors necessary to retrieve their
 *                                   records from GIOS and process it down
 *                                   the pipeline in the app
 * @return {[Object]}                Array of records for each sensor
 */
const get_all_sensor_secords = async (sensors_list) => {
    const portions = config.get('all_records_request_portions');
    const sensor_infos = sensors_list.map(({sensor_id, station_id, param}) => {
        return {sensor_id, param, station_id};
    });

    try {
        let records = await process_split_requests(
            sensor_infos,
            portions,
            get_sensor_records
        );
        // each station is representes by an array of data for its sensors
        // together we have a 2D array of data which needs to be flattened
        // for convenient linear processing when storing to the database
        records = records.flat();
        return records;
    } catch (e) {
        console.log('COULD NOT FETCH ALL SENSORS RECORDS');
        console.log(e);
        throw new Error('COULD NOT FETCH ALL SENSORS RECORDS');
    }
};

module.exports = get_all_sensor_secords;
