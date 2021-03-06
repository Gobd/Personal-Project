var mongoose = require('mongoose');
var ReviewConfig = require('./review.js');
var Review = ReviewConfig.model;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var beerSchema = new mongoose.Schema({
    name: String,
    srm: Number,
    ibu: Number,
    address : String,
    brewery: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    loc: {
        type: {type: String, enum: "Point", default: "Point"},
        coordinates: [Number]
    }
});

beerSchema.index({loc: '2dsphere'});
beerSchema.plugin(deepPopulate);

module.exports = {
    model: mongoose.model('Beer', beerSchema),
    schema: beerSchema
};
