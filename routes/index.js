import Station from '../db/stations/schema';
import Measurement from '../db/measurements/schema';
import {
  getAggregatedMeasurements,
  getAggregatedMeasurementsFromPeriod,
} from '../db/measurements/func';
import { measurementProjection, stationProjection } from '../db/projections';

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const stations = await Station.find({}, stationProjection);
  res.send(stations);
});

router.get('/:id', async (req, res) => {
  const data = await Measurement.findOne({ stationId: req.params.id }, measurementProjection);
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
