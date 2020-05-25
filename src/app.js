/**
 * This module intializes and exports express application and
 * establishes routing
 */

const express = require('express');
require('./db/mongoose');
const air_quality_router = require('./routers/air_quality_router');

const app = express();

app.use(express.json());
app.use(air_quality_router);

module.exports = app;
