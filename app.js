const express = require('express');
const cors = require('cors');

const database = require('./config/database');
const task = require('./tasks/sync.task');
const config = require('./config/app');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(routes);

database.connect();
task.start();

const server = app.listen(config.port, () => {
  console.log(`Listening at ${server.address().address}:${server.address().port}`);
});
