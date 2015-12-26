var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Defining a user schema
var userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
