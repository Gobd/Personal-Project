var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
  name: String,
  address: String,
  loc: {
    type: {type: String, enum: "Point", default: "Point"},
    coordinates: [Number]
  }
});

locationSchema.index({loc: '2dsphere'});

module.exports = mongoose.model('loc', locationSchema);
