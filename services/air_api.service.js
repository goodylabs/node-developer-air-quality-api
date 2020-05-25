const got = require('got')
const config = require('../config/app')

const fetchStations = async () => {
    return got.get(`${config.airApiBase}/station/findAll`).json()
}

const fetchSensors = async (stationId) => {
    return got.get(`${config.airApiBase}/station/sensors/${stationId}`).json()
}

const fetchMeasurements = (sensorId) => {
    return got.get(`${config.airApiBase}/data/getData/${sensorId}`).json()
}

module.exports = {
    fetchStations,
    fetchSensors,
    fetchMeasurements
}
