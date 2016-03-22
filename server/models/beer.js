var mongoose = require('mongoose');
var ReviewConfig = require('./review.js');
var Review = ReviewConfig.model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var beerSchema = new mongoose.Schema({
    name: String,
    srm: Number,
    ibu: Number,
    brewery: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

beerSchema.plugin(deepPopulate);

module.exports = {
    model: mongoose.model('Beer', beerSchema),
    schema: beerSchema
};
