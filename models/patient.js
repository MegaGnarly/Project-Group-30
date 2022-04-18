const mongoose = require("mongoose")

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
  firstName: String,
  lastName: String,
  id: String         
})

const patient = mongoose.model("patient", patientSchema) // compile the schema into a model

module.exports = patient // make model available to other files