const mongoose = require('mongoose');
const config = require('./app');

exports.connect = () => {
  mongoose.connect(config.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', (error) => {
    console.error('Failed to connect to MongoDB: ', error);
  });
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
};
