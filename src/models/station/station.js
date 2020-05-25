/**
 * Schema definition and model creation for the object
 * which will store the data about one air quality station
 */

const mongoose = require('mongoose');
const city_schema = require('./subdocuments/city_schema');

const station_schema = new mongoose.Schema(
    {
        station_id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        city: {
            type: city_schema,
            default: {
                name: '',
                commune: null,
            },
        },
        address: {
            type: String,
            default: '',
        },
    },
    {bufferCommands: false}
);

/**
 * This method formats the station data fetched from the GIOS API
 * according to our station_schema definition
 * @param {Object}  station_data an object received from GIOS API
 */
station_schema.statics.parse = (station_data) => {
    const {
        station_id,
        stationName: name,
        gegrLat: latitude,
        gegrLon: longitude,
        city: {
            id: city_id,
            name: city_name,
            commune: {
                communeName: commune_name,
                districtName: district,
                provinceName: province,
            },
        },
        addressStreet: address,
    } = station_data;

    const station = new Station({
        station_id,
        name,
        latitude,
        longitude,
        address: address ? address : '',
        city: {
            city_id,
            name: city_name,
            commune: {
                name: commune_name,
                district,
                province,
            },
        },
    });

    return station;
};

const Station = mongoose.model('Station', station_schema);

module.exports = Station;
