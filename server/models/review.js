var mongoose = require('mongoose'),
    User = require('./user.js'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    beerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beer' },
    rating: Number,
    review: String
});

reviewSchema.plugin(deepPopulate);

function ratingDisp(rat){
    var ret = [];
    for (var i = 1; i <= Math.round(rat); i++) {
        if (rat % 1 === 0 || i < rat){
            ret.push(0);
        } else {
            ret.push(1);
        }
    }
    return ret;
}

function addStars(next, data){
    data.forEach(function(e){
        e.avgRating = ratingDisp(e.rating);
    });
    next();
}

reviewSchema.pre('init', addStars);

module.exports = {
    model: mongoose.model('Review', reviewSchema),
    schema: reviewSchema
};
