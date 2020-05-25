/**
 * The schema for a subdocument which stores info about the city
 * near which each station is located - subdocument of the station_schema
 */
const mongoose = require('mongoose');
const commune_schema = require('./commune_schema');

const city = new mongoose.Schema(
    {
        city_id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
            default: '',
        },
        commune: {
            type: commune_schema,
            required: true,
            default: {
                name: '',
                district: '',
                province: '',
            },
        },
    },
    {_id: false}
);

module.exports = city;
