const mongoose = require('mongoose')

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
            provinceName: String
        }
    },
    addressStreet: String
})

module.exports = mongoose.model('Station', schema)
