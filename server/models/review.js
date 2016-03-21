var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    username: String,
    review: String,
    userId: Number,
    rating: Number
});

module.exports = reviewSchema;
