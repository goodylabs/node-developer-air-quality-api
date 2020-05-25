const router = require('express').Router();
const controllers = require('../controllers/stations.controller');

router.get('/stations', controllers.all);
router.get('/stations/:id', controllers.findById);
router.get('/stations/:id/measurements/latest', controllers.getLatestMeasurements);
router.get('/stations/:id/measurements', controllers.getMeasurements);

module.exports = router;
