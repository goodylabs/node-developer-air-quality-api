import { getStations } from '../api/controller';

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const stations = await getStations();
  res.send(stations);
});

router.get('/:name', (req, res) => {
  res.send(`pomiary dla stacji ${req.params.name}`);
});

module.exports = router;
