const mongoose = require('mongoose');

export const measurementSchema = mongoose.Schema({
  stationId: { type: Number, required: true },
  measurements: [
    {
      key: { type: String, required: true },
      values: [
        {
          date: { type: Date, required: true },
          value: Number,
        },
      ],
    },
  ],
});

const Measurement = mongoose.model('Measurement', measurementSchema);
export default Measurement;
