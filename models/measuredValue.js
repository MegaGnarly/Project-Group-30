const mongoose = require('mongoose')

const schema = {
    username: String,
    date: String,
    time: String,
    // dateTime: {type:Date, default:Date.now},
    // measured_type: String,
    measured_glucose: Number,
    measured_weight: Number,
    measured_insulin: Number,
    measured_exercise: Number,
    comment: String,
}

const measuredValue = mongoose.model('measuredValue', schema)

module.exports = measuredValue