const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  stationId: Number,
  type: String,
  date: Date,
  value: Number,
});

// eslint-disable-next-line func-names
schema.methods.toJSON = function () {
  return {
    type: this.type,
    date: this.date,
    value: this.value,
  };
};

module.exports = mongoose.model('Measurement', schema);
