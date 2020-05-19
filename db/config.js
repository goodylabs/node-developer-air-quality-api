const mongoose = require('mongoose');

export const configureDatabase = () => {
  try {
    const uri = 'mongodb://localhost/air_quality_db';
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.error(`Connected to MongoDB at ${uri}`);
  } catch (e) {
    console.error('Error connecting to db');
  }
};

export default configureDatabase;
