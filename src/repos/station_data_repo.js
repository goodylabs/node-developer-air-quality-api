/**
 * Implements repo for managing data about available air quality stations.
 * Defines functions for saving them to the database and retrieving.
 */
const _ = require('lodash');
const get_stations_list = require('../apis/get_stations_list');
const Station = require('../models/station/station');

/**
 * Initiates HTTP request to get available data about air quality
 * tracking stations from the GIOS API. Applies helper functions
 * to convert fetched data to fit our data models and saves stations
 * data to the database, if they are not already contained there.
 */
const update = async () => {
    try {
        const stored = await Station.find({}, {station_id: 1});
        const fetched = await get_stations_list();

        const new_stations = _.differenceBy(fetched, stored, 'station_id');
        const new_stations_data = new_stations.map((station) => {
            // converting GIOS output to fit our model before saving
            return new Station(Station.parse(station));
        });

        await save(new_stations_data);
    } catch (e) {
        console.log('COULD NOT UPDATE THE STATIONS DATA');
        console.log(e);
    }
};

/**
 * Checks if the given station exists in the database
 * @param  {Number}     station_id  ID of the station to retrieve
 * @return {Object}                 Object containing station_id if found,
 *                                  null otherwise
 */
const find_one = async (station_id) => {
    const station = await Station.findOne(
        {station_id},
        {_id: 0, station_id: 1}
    );
    return station;
};

/**
 * Retrieves the list of all stations from the database
 * @return {[Object]}    List of objects with stations data
 */
const get_all = async () => {
    const stations = await Station.find({}, {_id: 0, __v: 0});
    return stations;
};

/**
 * Saves data about stations to the database
 * * @param  {[Object]} stations  List of objects containing data about
 *                                the stations to be saved
 */
async function save(stations) {
    const save_promises = stations.map((station) => station.save());
    await Promise.all(save_promises);
}

module.exports = {update, find_one, get_all};
