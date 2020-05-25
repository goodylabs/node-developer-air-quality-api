const Station = require('../models/Station');
const Measurement = require('../models/Measurement');

const listAll = () => new Promise((resolve, reject) => {
  Station.find().then((result) => {
    const entries = result.map((entry) => entry.toJSON());
    resolve(entries);
  }).catch((err) => {
    reject(err);
  });
});

const findById = (id) => new Promise((resolve, reject) => {
  Station.findOne({ id }).then((result) => {
    resolve(result.toJSON());
  }).catch((err) => {
    reject(err);
  });
});

const getLatestData = (id) => new Promise((resolve, reject) => {
  Measurement.findOne({ stationId: id }).sort({ date: -1 }).limit(1).then(((latest) => {
    Measurement.find({ stationId: id, date: latest.date }).then((result) => {
      const entries = result.map((entry) => entry.toJSON());
      resolve(entries);
    });
  }))
    .catch((err) => {
      reject(err);
    });
});

module.exports = {
  listAll,
  findById,
  getLatestData,
};
