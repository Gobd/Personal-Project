var mongoose = require('mongoose');
var beerModel = require('./beer.js');

var locationSchema = new mongoose.Schema({
  name: String,
  address: String,
  beers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'beerModel' }],
  loc: {
    type: {type: String, enum: "Point", default: "Point"},
    coordinates: [Number]
  }
});

locationSchema.index({loc: '2dsphere'});

module.exports = mongoose.model('loc', locationSchema);
