const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    stationId: Number,
    type: String,
    date: Date,
    value: Number
})

module.exports = mongoose.model('Measurement', schema)
