const mongoose = require('mongoose')

const schema = {
    username: String,
    // dateTime: String,
    dateTime: {type:Date, default:Date.now},
    note: String
}

const clinical_note = mongoose.model('clinical_note', schema)

module.exports = clinical_note