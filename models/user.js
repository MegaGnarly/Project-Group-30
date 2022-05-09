const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')

// declare a Mongoose schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: String,     // Patient or Clinician 
  age: Number,
  secret: { type: String, required: true }
})

userSchema.methods.verifyPassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, valid) => {
    callback(err, valid)
  })
}

const SALT_FACTOR = 10
// Hash password before saving
userSchema.pre('save', function save(next) {
  const user = this
  // Go to next if password field has not been modified
  if (!user.isModified('password')) {
    return next()
  }
  // Automatically generate salt, and calculate hash
  bcrypt.hash(user.password, SALT_FACTOR, (err, hash) => {
    if (err) {
      return next(err)
    }
    // Replace password with hash
    user.password = hash
    next()
  })
})

// compile the schema into a model
const user = mongoose.model("user", userSchema)

// make model available to other files
module.exports = user;


