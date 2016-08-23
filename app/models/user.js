var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');
var crypto = require('crypto');


var User = db.Model.extend({

  tableName: 'users',
  //TODO:
  // defaults: {
  //   isLoggedIn: false,
  // },

  links: function() {
    return this.hasMany(Links);
  },

  initialize: function() {
    //'creating' triggered,
    this.on('creating', function(model, attrs, options) {
      //create hash code
      var shasum = crypto.createHash('sha1');
      //hash code assigned to url
      shasum.update(model.get('password'));
      //url model's code view is set to shortened address
      // console.log('model');
      // console.log(model);
      // console.log('attributes');
      // console.log(attrs.username);
      // model.set('password', attrs.password);
      // model.set('username', attrs.username);
    });
  }
});

module.exports = User;