const router = require('express').Router();
const controllers = require('../controllers/stations.controller');

router.get('/stations', controllers.all);
router.get('/stations/:id', controllers.findById);
router.get('/stations/:id/measurements', controllers.getLatestMeasurements);
router.get('/stations/:id/measurements/aggregated', controllers.getMeasurements);

module.exports = router;
