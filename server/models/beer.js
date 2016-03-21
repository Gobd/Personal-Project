var mongoose = require('mongoose');
var reviewSchema = require('./review.js');

var beerSchema = new mongoose.Schema({
    name: String,
    srm: Number,
    ibu: Number,
    reviews: [reviewSchema]
});

module.exports = mongoose.model('beer', beerSchema);
