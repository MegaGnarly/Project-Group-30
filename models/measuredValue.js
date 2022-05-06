const mongoose = require('mongoose')

const schema = {
    username: String,
    // dateTime: String,
    dateTime: {type:Date, default:Date.now},
    measured_type: String,
    measured_value: String,
    comment: String
}

const measuredValue = mongoose.model('measuredValue', schema)

module.exports = measuredValue