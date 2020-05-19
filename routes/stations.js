import { getMeasuresByStation, getStations } from '../api/controller';

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const stations = await getStations();
  res.send(stations);
});

router.get('/:id', async (req, res) => {
  const data = await getMeasuresByStation(req.params.id);
  res.send(data);
});

module.exports = router;
