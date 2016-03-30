var mongoose = require('mongoose');
var beerConfig = require('./beer.js');
var Beer = beerConfig.model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var locationSchema = new mongoose.Schema({
  name: String,
  address: String,
  beers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beer' }],
  loc: {
    type: {type: String, default: "Point"},
    coordinates: [Number]
  }
});

locationSchema.index({loc: '2dsphere'});

locationSchema.plugin(deepPopulate);

module.exports = mongoose.model('Location', locationSchema);