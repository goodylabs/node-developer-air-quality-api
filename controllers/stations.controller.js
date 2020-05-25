const stations = require('../services/stations.service');

const all = async (req, res, next) => {
  try {
    const result = await stations.listAll();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

const findById = async (req, res, next) => {
  try {
    const result = await stations.findById(req.params.id);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

const getLatestMeasurements = async (req, res, next) => {
  try {
    const result = await stations.getLatestData(req.params.id);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

const getMeasurements = async (req, res, next) => {
  try {
    const result = await stations.getMeasurementsData(req.params.id, req.params.from);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  all,
  findById,
  getLatestMeasurements,
  getMeasurements,
};
