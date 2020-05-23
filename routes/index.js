import Station from '../db/stations/schema';
import Measurement from '../db/measurements/schema';
import {
  getAggregatedMeasurements,
  getAggregatedMeasurementsFromPeriod,
} from '../db/measurements/func';

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const stations = await Station.find({});
  res.send(stations);
});

router.get('/:id', async (req, res) => {
  const data = await Measurement.find({ stationId: req.params.id });
  res.send(data);
});

router.get('/:id/avg', async (req, res) => {
  const data = await getAggregatedMeasurements(req.params.id, req.body.date);
  res.send(data);
});

router.get('/:id/avg/period', async (req, res) => {
  const data = await getAggregatedMeasurementsFromPeriod(
    req.params.id,
    req.body.start,
    req.body.end,
  );
  res.send(data);
});

module.exports = router;
