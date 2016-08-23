var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({

  tableName: 'users',
  //TODO:
  defaults: {
    isLoggedIn: false,

  },

  changeLoginState: function() {
    if (this.get(isLoggedIn) === false) {
    }
    
  },



});

module.exports = User;