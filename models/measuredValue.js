const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    measured_value: {type: String, required: true},
    comment: String
})
const measuredValue = mongoose.model('measuredValue', schema)
module.exports = measuredValue