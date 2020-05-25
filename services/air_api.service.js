const got = require('got');
const config = require('../config/app');

const fetchStations = async () => got.get(`${config.airApiBase}/station/findAll`).json();

const fetchSensors = async (stationId) => got.get(`${config.airApiBase}/station/sensors/${stationId}`).json();

const fetchMeasurements = (sensorId) => got.get(`${config.airApiBase}/data/getData/${sensorId}`).json();

module.exports = {
  fetchStations,
  fetchSensors,
  fetchMeasurements,
};
