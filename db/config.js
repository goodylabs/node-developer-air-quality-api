const mongoose = require('mongoose');

const configureDatabase = () => {
  try {
    mongoose.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB at ${process.env.DB_CONNECTION_STRING}`);
  } catch (e) {
    console.error('Error connecting to db');
  }
};

export default configureDatabase;
