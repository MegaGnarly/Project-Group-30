const mongoose = require("mongoose")

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
  username: String,
  firstName: String,
  lastName: String,
  // required_data: [{blood_glucose:Boolean, weight:Boolean, insulin_doses:Boolean, exercise:Boolean}],
  blood_glucose_requirement: [{required:Boolean, min:Number, max:Number}],
  weight_requirement: [{required:Boolean, min:Number, max:Number}],
  insulin_doses_requirement: [{required:Boolean, min:Number, max:Number}],
  exercise_requirement: [{required:Boolean, min:Number, max:Number}]
})

const patient = mongoose.model("patient", patientSchema) // compile the schema into a model

// make model available to other files
module.exports = patient;