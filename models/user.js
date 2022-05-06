const mongoose = require("mongoose")

// declare a Mongoose schema
const userSchema = new mongoose.Schema({  
  username: String,
  password: String,
  role: String,     // Patient or Clinician 
  age: Number,         
})

// compile the schema into a model
const user = mongoose.model("user", userSchema) 

// make model available to other files
module.exports = user;


