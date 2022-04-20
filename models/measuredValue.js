const mongoose = require('mongoose')

const schema = {
    name: String,
    dateTime: String,
    measured_value: String,
    comment: String
}

const measuredValue = mongoose.model('measuredValue', schema)

module.exports = measuredValue