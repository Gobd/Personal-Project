var mongoose = require('mongoose'),
    User = require('./user.js'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    beerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beer' },
    review: String
});

reviewSchema.plugin(deepPopulate);

module.exports = {
    model: mongoose.model('Review', reviewSchema),
    schema: reviewSchema
};
