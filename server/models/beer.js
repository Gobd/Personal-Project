var mongoose = require('mongoose');
var reviewSchema = require('./review.js');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var beerSchema = new mongoose.Schema({
    name: String,
    srm: Number,
    ibu: Number,
    brewery: mongoose.Schema.Types.ObjectId,
    reviews: [reviewSchema]
});

beerSchema.plugin(deepPopulate);

module.exports = {
    schema: beerSchema,
    model: mongoose.model('beer', beerSchema)
};
