/**
 * This file implements the first stage of pipeline employed to get
 * air quality and station data from GIOS. It consists of 3 stages:
 * 1) get station data (incl. IDs) - get_stations_list file;
 * 2) get data for sensors for each station (incl. IDs)
 * - get_all_sensors.js
 * 3) get available records for each sensor by ID
 * - get_all_sensors_records.js
 */
const config = require('config');
const stations_uri = config.get('stations_uri');
const rp = require('request-promise');

/**
 * Get the list of GIOS station
 * @return {[Object]}     Objects containing info about every station
 *                        currently available from GIOS API
 */
const get_stations_list = async () => {
    try {
        let stations_list = await rp({
            uri: stations_uri,
            json: true,
        });
        stations_list = stations_list.map((station) => {
            station.station_id = station.id;
            delete station.id;
            return station;
        });

        return stations_list;
    } catch (e) {
        console.log('COULD NOT FETCH THE STATIONS LIST');
        console.log(e);
        throw new Error('COULD NOT FETCH THE STATIONS LIST');
    }
};

module.exports = get_stations_list;
