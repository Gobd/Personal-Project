var mongoose = require('mongoose');
var beer = require('./beer.js');
var beerModel = beer.model;
var beerSchema = beer.schema;

var locationSchema = new mongoose.Schema({
  name: String,
  address: String,
  beers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'beer' }],
  loc: {
    type: {type: String, enum: "Point", default: "Point"},
    coordinates: [Number]
  }
});

locationSchema.index({loc: '2dsphere'});

module.exports = mongoose.model('loc', locationSchema);
