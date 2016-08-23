var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');

var Link = db.Model.extend({
  
  tableName: 'urls',
  hasTimestamps: true,

  defaults: {
    visits: 0
  },

  clicks: function() {
    return this.hasMany(Click);
  },

  initialize: function() {
    //'creating' triggered,
    this.on('creating', function(model, attrs, options) {
      //create hash code
      var shasum = crypto.createHash('sha1');
      //hash code assigned to url
      shasum.update(model.get('url'));
      //url model's code view is set to shortened address
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
