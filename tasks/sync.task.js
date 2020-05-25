const schedule = require('node-schedule');
const Station = require('../models/Station');
const Measurement = require('../models/Measurement');
const config = require('../config/app');
const { fetchMeasurements, fetchStations, fetchSensors } = require('../services/air_api.service');

const syncData = async () => {
  console.log(`Synchronizing api data at ${new Date()}`);

  const stations = await fetchStations();

  for await (const station of stations) {
    console.log(`Synchronizing station ${station.stationName} (${station.id})`);

    Station.updateOne({ id: station.id }, station, {
      upsert: true,
    }, (err, _) => {
      if (err) console.error(`Failed to save station with id ${station.id}`);
    });

    const sensors = await fetchSensors(station.id);
    for await (const sensor of sensors) {
      const measurements = await fetchMeasurements(sensor.id);
      for (const measurement of measurements.values) {
        const { date, value } = measurement;
        const newEntry = {
          stationId: station.id,
          type: measurements.key,
          date,
          value,
        };

        Measurement.updateOne({
          stationId: station.id,
          type: sensor.param.paramCode,
          date: measurement.date,
        }, newEntry, {
          upsert: true,
        }, (err, _) => {
          if (err) console.error(`Failed to save measurement: ${err}`);
        });
      }
    }
  }

  console.log(`Finished synchronizing api data at ${new Date()}`);
};

const start = () => {
  syncData();
  schedule.scheduleJob(config.cronExpression, async () => {
    syncData();
  });
};

exports.start = start;
