const moment = require('moment');
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

const getMeasurementsData = (id, from, to) => new Promise((resolve, reject) => {
  const fromDate = moment(from);
  const toDate = moment(to);

  const criteria = {
    stationId: +id,
  };

  if (fromDate.isValid() || toDate.isValid()) {
    criteria.date = {
      ...(fromDate.isValid() ? { $gte: from } : {}),
      ...(toDate.isValid() ? { $lte: to } : {}),
    };
  }

  Measurement.aggregate([
    {
      $match: criteria,
    },
    {
      $group: {
        _id: '$type',
        average: {
          $avg: '$value',
        },
      },
    },
    {
      $project: {
        type: '$_id',
        _id: false,
        value: '$average',
      },
    },
  ]).then((result) => {
    resolve(result);
  }).catch((err) => {
    reject(err);
  });
});

module.exports = {
  listAll,
  findById,
  getLatestData,
  getMeasurementsData,
};
