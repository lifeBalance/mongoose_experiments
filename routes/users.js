var mongoose = require('mongoose');
var User = require('../models/user');

// GET users
exports.index =  function(req, res, next) {
  User.find(function(err, users) {
    if (err) {
      console.log('Error finding %s: %s', user.name, err);
      return next(err);
    } else {
      res.render( 'users/index', {
        title : 'Users List',
        users : users
      });
    }
  });
};

// GET users/:id
exports.show =  function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (user === null) {
      console.log("> User with Id: '%s' does not exist. User: %s - Error: %s", req.params.id, user, err);
      return next(err);
    } else {
      console.log("> Showing user '%s'", user.name);

      res.render( 'users/user', {
        title: 'User Profile',
        user: user
      });
    }
  });
};

// GET users/new
exports.new =  function(req, res) {
  res.render('users/new', {
    title: 'New User',
    btnMsg: 'Create'
  });
};

// POST users
exports.create =  function(req, res, next) {
  User.create({
    name: req.body.name,
    email: req.body.email,
    modifiedOn: Date.now(),
    lastLogin: Date.now()
  }, function (err, user) {
    if (err) {
      console.log('Error creating new user: ', err);
      return next(err);
    } else {
      console.log("User '%s' created", user.name);
      res.redirect('/users');
    }
  });
};
