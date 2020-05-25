const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: Number,
  stationName: String,
  gegrLat: String,
  gegrLon: String,
  city: {
    id: Number,
    name: String,
    commune: {
      communeName: String,
      districtName: String,
      provinceName: String,
    },
  },
  addressStreet: String,
});

// eslint-disable-next-line func-names
schema.methods.toJSON = function () {
  return {
    id: this.id,
    stationName: this.stationName,
    gegrLat: this.gegrLat,
    gegrLon: this.gegrLon,
    city: this.city,
    addressStreet: this.addressStreet,
  };
};

module.exports = mongoose.model('Station', schema);
