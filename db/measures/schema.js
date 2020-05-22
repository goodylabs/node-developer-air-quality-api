const mongoose = require('mongoose');

export const measureSchema = mongoose.Schema({
  stationId: { type: Number, required: true },
  measures: [
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

const Measure = mongoose.model('Measure', measureSchema);
export default Measure;
