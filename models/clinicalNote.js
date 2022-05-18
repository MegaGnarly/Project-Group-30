const mongoose = require('mongoose')

const schema = {
    username: String,
    date: String,
    time: String,
    note: String
}

const clinicalNote = mongoose.model('clinicalNote', schema)

module.exports = clinicalNote