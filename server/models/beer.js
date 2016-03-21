var mongoose = require('mongoose');
var reviewSchema = require('./review.js');

var beerSchema = new mongoose.Schema({
    name: String,
    srm: Number,
    ibu: Number,
    brewery: String,
    reviews: [reviewSchema]
});

module.exports = {
    model: mongoose.model('beer', beerSchema),
    schema: beerSchema
};
