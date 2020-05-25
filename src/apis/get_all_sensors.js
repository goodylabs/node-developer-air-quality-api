/**
 * Functions in this file provide the capabilities necessary
 * to implement the second stage of air quality data fetching from GIOS -
 * retrieving information about sensors belonging to each station.
 * Once we have the IDs of all sensors, we will be able to fetch air
 * quality data for all of them
 */
const config = require('config');
const rp = require('request-promise');
const process_split_requests = require('../utils/process_split_requests');

/**
 * Fetches info about sensors belonging to the individual station
 * @param  {Number}   station_id   ID of the station whose sensors will
 *                                 be retrieved
 * @return {[Object]}              Array of objects with sensor data
 */
async function get_station_sensors(station_id) {
    const sensors_uri = config.get('sensors_uri');
    try {
        const sensors = await rp({
            uri: sensors_uri + station_id,
            json: true,
        });
        return sensors;
    } catch (e) {
        console.log('COULD NOT GET ONE SENSOR INFO');
        throw new Error('COULD NOT GET ONE SENSOR INFO');
    }
}

/**
 * Fetches info about all sensors available from GIOS
 * @param  {[Object]} stations_list  Objects received from GIOS API for
 *                                   fetching sensors per station -
 *                                   containing stations ID needed for
 *                                   requests for sensors info
 *
 * @return {[Object]}              Array of objects with sensor data
 */
const get_all_sensors = async (stations_list) => {
    const portions = config.get('all_sensors_request_portions');
    const station_ids = stations_list.map((station) => station.station_id);

    try {
        let sensors = await process_split_requests(
            station_ids,
            portions,
            get_station_sensors
        );

        // 2D array where sensors representing each station are grouped
        // into subarray. Flattened before passing to the next GIOS data
        // fetching pipeline stage
        sensors = sensors.flat();
        return sensors;
    } catch (e) {
        console.log('COULD NOT FETCH ALL SENSORS DATA');
        console.log(e);
        throw new Error('COULD NOT FETCH ALL SENSORS DATA');
    }
};

module.exports = get_all_sensors;
