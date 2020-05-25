const express = require('express');
const cors = require('cors');

const database = require('./config/database');
const task = require('./tasks/sync.task');
const config = require('./config/app');

const app = express();
app.use(cors());

database.connect();
task.start();

app.get('/', (req, res) => res.send('Working'));

const server = app.listen(config.port, () => {
  console.log(`Listening at ${server.address().address}:${server.address().port}`);
});
