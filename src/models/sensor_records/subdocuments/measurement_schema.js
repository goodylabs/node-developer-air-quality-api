/**
 * Mongoose schema for the individual hourly records of the
 * particular air quality parameter - defines a subdocument of the
 * sensor_records schema
 */

const mongoose = require('mongoose');

const measurement_schema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        value: {
            type: Number,
            default: null,
        },
    },
    {_id: false}
);

module.exports = measurement_schema;
