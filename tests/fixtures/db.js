/**
 * This file sets up a small mock database for testing purposes
 * using the collection of data from ./tests/mockData folder
 * These data were sampled from actual data regarding the air quality
 * fetched from GIOS API during 18-24th of May and appended with some fake
 * data
 */

const mongoose = require('mongoose');
const Station = mongoose.model('Station');
const SensorRecords = mongoose.model('SensorRecords');
const stations_data = require('../mock_data/stations_data');
const sensor_records_data = require('../mock_data/sensor_records_data');

const seed = async () => {
    let save_promises = stations_data.real.map((station) => {
        new Station(station).save();
    });
    save_promises.concat(
        sensor_records_data.map((record) => {
            new SensorRecords(record).save();
        })
    );
    await Promise.all(save_promises);
};

const clear = async () => {
    await Station.deleteMany();
    await SensorRecords.deleteMany();
};

const seed_stations = async () => {
    await SensorRecords.deleteMany();
    let save_promises = stations_data.real.map((station) => {
        new Station(station).save();
    });
    await Promise.all(save_promises);
};

module.exports = {seed, clear, seed_stations};
