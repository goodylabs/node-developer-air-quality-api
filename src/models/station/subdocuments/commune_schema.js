/**
 * The schema for a subdocument which stores info about the community
 * where each station is located - subdocument of the city_schema
 */

const mongoose = require('mongoose');

const commune_schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        province: {
            type: String,
            required: true,
        },
    },
    {_id: false}
);

module.exports = commune_schema;
