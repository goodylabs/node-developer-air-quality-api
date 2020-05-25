/**
 * Definition of the schema which stores info about records for each
 * individual sensors. The sensors are matched to the corresponding
 * station with the station_id property. It was decided to keep data
 * stored per sensor, as it allows straightforward data flow from
 * GIOS API which also caters data per sensor. At the same time, there is
 * no need to split measurement records into smaller chunks - BSON
 * documents of MongoDB is 16MB, which will suffice for centuries under
 * the current data format
 */

const mongoose = require('mongoose');
const measurement_schema = require('./subdocuments/measurement_schema');

const record_schema = new mongoose.Schema(
    {
        values_updated_at: {
            type: Date,
            required: true,
        },
        key: {
            type: String,
            required: true,
        },
        station_id: {
            type: Number,
            required: true,
        },
        param: {
            type: String,
            required: true,
        },
        sensor_id: {
            type: Number,
            required: true,
        },
        values: {
            type: [measurement_schema],
            default: [],
        },
    },
    {bufferCommands: false}
);

const sensor_records = mongoose.model('SensorRecords', record_schema);

module.exports = sensor_records;
