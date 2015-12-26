var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Defining a project schema
var projectSchema = new Schema({
  projectName: String,
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  createdBy: String,
  contributors: String,
  tasks: String
});

// Compile Project model from projectSchema definition
module.exports = mongoose.model('Project', projectSchema);
