const router = require('express').Router();
const controllers = require('../controllers/stations.controller');

router.get('/stations', controllers.all);
router.get('/stations/:id', controllers.findById);
router.get('/stations/:id/latest', controllers.getLatestData);

module.exports = router;
