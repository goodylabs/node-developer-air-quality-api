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
    if (!result) {
      res.status(404).send({ error: 'Station not found' });
      return;
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
};

const getLatestMeasurements = async (req, res, next) => {
  try {
    const station = await stations.findById(req.params.id);
    if (!station) {
      res.status(404).send({ error: 'Station not found' });
      return;
    }

    const result = await stations.getLatestData(req.params.id);
    if (!result) {
      res.status(404).send({ error: 'Station not found' });
      return;
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
};

const getMeasurements = async (req, res, next) => {
  try {
    const station = await stations.findById(req.params.id);
    if (!station) {
      res.status(404).send({ error: 'Station not found' });
      return;
    }

    const result = await stations.getMeasurementsData(
      req.params.id, new Date(req.query.from), new Date(req.query.to),
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
};

const getDailyMeasurements = async (req, res, next) => {
  const station = await stations.findById(req.params.id);
  if (!station) {
    res.status(404).send({ error: 'Station not found' });
    return;
  }

  const from = new Date(req.query.date);
  from.setHours(0, 0, 0, 0);

  const to = new Date(req.query.date);
  from.setHours(23, 59, 59, 999);

  try {
    const result = await stations.getMeasurementsData(
      req.params.id, from, to,
    );
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
  getDailyMeasurements,
};
