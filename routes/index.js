const router = require('express').Router();
const controllers = require('../controllers/stations.controller');

router.get('/', controllers.all);

module.exports = router;
