const mongoose = require('mongoose');

export const stationSchema = mongoose.Schema({
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

const Station = mongoose.model('Station', stationSchema);
export default Station;
