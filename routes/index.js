import Station from '../db/stations/schema';
import Measure from '../db/measures/schema';
import {
  getAggregatedMeasures,
  getAggregatedMeasuresFromPeriod,
} from '../db/measures/func';

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const stations = await Station.find({});
  res.send(stations);
});

router.get('/:id', async (req, res) => {
  const data = await Measure.find({ stationId: req.params.id });
  res.send(data);
});

router.get('/:id/avg', async (req, res) => {
  const data = await getAggregatedMeasures(req.params.id, req.body.date);
  res.send(data);
});

router.get('/:id/avg/period', async (req, res) => {
  const data = await getAggregatedMeasuresFromPeriod(
    req.params.id,
    req.body.start,
    req.body.end,
  );
  res.send(data);
});

module.exports = router;
