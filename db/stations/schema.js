const mongoose = require('mongoose');

export const stationSchema = mongoose.Schema({
  id: { type: Number, required: true },
  stationName: { type: String, required: true },
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
