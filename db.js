var mongoose = require('mongoose');

// The connection string
var dbUri = 'mongodb://localhost/experiments';

// A default database connection
mongoose.connect(dbUri);

// Just for easier manipulation of the default connection
var defConn = mongoose.connection;

// Listening for connection events
defConn.on('connected', function () {
  console.log('Successfully connected to ' + dbUri);
});

defConn.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

defConn.on('disconnected', function () {
  console.log('Mongoose disconnected!');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  defConn.close(function () {
    console.log('Mongoose connection finished. App termination');
    process.exit(0);
  });
});

// Bring the models
var User = require('./models/user');
var Project = require('./models/project');
