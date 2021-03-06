var geocoderProvider = 'google',
    config = require('../config'),
    extra = {apiKey: config.maps},
    geocoder = require('node-geocoder')(geocoderProvider, 'https', extra),
    Location = require('../models/location.js'),
    _ = require('lodash'),
    BeerConfig = require('../models/beer.js'),
    Beer = BeerConfig.model,
    ReviewConfig = require ('../models/review.js'),
    Review = ReviewConfig.model,
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    User = require('../models/user.js'),
    qs = require('query-string'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    requestExt = require('request-extensible'),
    RequestHttpCache = require('request-http-cache'),
    join = Promise.join;

var httpRequestCache = new RequestHttpCache({
    max: 1024*51200
});

var request = requestExt({
    extensions: [
        httpRequestCache.extension
    ]
});

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

function addReviewCount(brewery, beerCheck){
    if (!arguments[1]){beerCheck = false;}
    var arr = true;
    if (beerCheck) {
        return _.forEach(brewery, function(beer){
            beer.avgRating = 0;
            _.forEach(beer.reviews, function(review){
                if (review.rating)
                    beer.avgRating += review.rating;
            });
            beer.avgRating = beer.avgRating/beer.reviews.length;
            beer.avgRating = ratingDisp(beer.avgRating);
        });
    }
    if (!_.isArray(brewery)) {
        brewery = [brewery];
        arr = false;
    }
        var ret =  _.forEach(brewery, function(brewery){
            brewery.reviewCount = 0;
            brewery.avgRating = 0;
            _.forEach(brewery.beers, function(beer){
                beer.avgRating = 0;
                brewery.reviewCount += beer.reviews.length;
                _.forEach(beer.reviews, function(review){
                    if (review.rating)
                        beer.avgRating += review.rating;
                        brewery.avgRating += review.rating;
                });
                beer.avgRating = beer.avgRating/beer.reviews.length;
                beer.avgRating = ratingDisp(beer.avgRating);
            });
            brewery.avgRating = brewery.avgRating/brewery.reviewCount;
            brewery.avgRating = ratingDisp(brewery.avgRating);
        });
    if (arr) {return ret;} else {return ret[0];}
}

function distance(origin, locs, res) {
    var arr = true;
    if (!arguments[0]) {
        res.status(200).json(locs);
        return;
    }
    if (!_.isArray(locs)) {
        locs = [locs];
        arr = false;
    }
    var params = {
        units: 'imperial',
        mode: 'driving',
        origins: origin,
        destinations: '',
        key: config.distance
    };
    _.forEach(locs, function(obj){
        if (obj.address) {
            params.destinations += obj.address + '|';
        } else {
            params.destinations += obj.brewery.address + '|';
        }
    });
    request({
        url: "https://maps.googleapis.com/maps/api/distancematrix/json",
        qs: params
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            _.forEach(locs, function(obj, idx){
                obj.distance = body.rows[0].elements[idx].distance.text;
                obj.travelTime = body.rows[0].elements[idx].duration.text;
            });
            arr ? res.status(200).json(locs) : res.status(200).json(locs[0]);
        } else {
            res.status(500).json(error);
        }
    });
}

var makeQuery = function(location, search){
    var query = {
        "loc": {
            $near: {
                $geometry: {type: "Point", coordinates: location},
                $maxDistance: 100*1609.34
            }
        }
    };
    if (search){
        _.merge(query, search);
    }
    return query;
};

var makeRegex = function(search){
    if (/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(search)) {search = '.';}
    return new RegExp('\\w*(' + search + ')\\w*', "ig");
};

module.exports = {

    getAddress: function (req, res) {
        geocoder.reverse({lat: req.query.lat, lon: req.query.long}, function (err, resp) {
            err ? res.status(500).json(err) : res.status(200).json(resp);
        });
    },

    getCoords: function (req, res) {
        geocoder.geocode(req.query.address, function (err, resp) {
            err ? res.status(500).json(err) : res.status(200).json(resp);
        });
    },

    getRand: function(req, res){
        geocoder.geocode(req.query.location, function (err, resp) {
            if (err) res.status(500).json(err);
            var location = [resp[0].longitude, resp[0].latitude];
            var query = makeQuery(location);
            Location
                .find(query)
                .deepPopulate('beers.reviews, beers.brewery')
                .lean()
                .exec(function (err, resp) {
                    var ret = _.shuffle(_.sampleSize(resp, 5));
                    var beers = [];
                    _.forEach(ret, function(brewery){
                        brewery.reviewCount = 0;
                        brewery.avgRating = 0;
                        _.forEach(brewery.beers, function(beer){
                            beer.avgRating = 0;
                            _.forEach(beer.reviews, function(review){
                                if (review.rating)
                                    beer.avgRating += review.rating;
                                    brewery.avgRating += review.rating;
                            });
                            beer.avgRating = beer.avgRating/beer.reviews.length;
                            beer.avgRating = ratingDisp(beer.avgRating);
                            brewery.reviewCount += beer.reviews.length;
                            beer.address = beer.brewery.address;
                            beers.push(beer);
                        });
                        brewery.avgRating = brewery.avgRating/brewery.reviewCount;
                        brewery.avgRating = ratingDisp(brewery.avgRating);
                        delete brewery.beers;
                    });
                    ret = _.concat(ret, beers);
                    err ? res.status(500).json(err) : distance(req.query.location, ret, res);
                });
        });
        },

    getBrewery: function (req, res) {
        var reg;
        req.query = _.omitBy(req.query, _.isEmpty);
        if (req.query.name && !req.query.location) {
            reg = makeRegex(req.query.name);
                    Location.find({name: reg}).deepPopulate('beers.brewery beers.reviews').lean().exec(function(err, resp){
                        var ret = addReviewCount(resp);
                        err ? res.status(500).json(err) : res.status(200).json(ret);
                    });
            } else if (req.query.beer && !req.query.location) {
                reg = makeRegex(req.query.beer);
                Beer.find({name: reg}).deepPopulate('reviews brewery').lean().exec(function(err, resp){
                    var ret = addReviewCount(resp, true);
                    err ? res.status(500).json(err) : res.status(200).json(ret);
                });
        } else if (req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                reg = makeRegex(req.query.name);
                Location.find(makeQuery(location, {name: reg})).deepPopulate('beers.brewery beers.reviews').lean()
                .exec(function (err, resp) {
                    var ret = addReviewCount(resp);
                    err ? res.status(500).json(err) : distance(req.query.location, ret, res);
                });
            });
        } else if (req.query.beer && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                reg = makeRegex(req.query.beer);
                var location = [resp[0].longitude, resp[0].latitude];
                Beer.find(makeQuery(location, {name: reg})).deepPopulate('reviews brewery').lean()
                .exec(function (err, resp) {
                    var ret = addReviewCount(resp, true);
                    err ? res.status(500).json(err) : distance(req.query.location, ret, res);
                });
            });
        } else if (!req.query.beer && !req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                Location.find(makeQuery(location)).deepPopulate('beers.brewery beers.reviews').lean()
                .exec(function (err, resp) {
                    var ret = addReviewCount(resp);
                    err ? res.status(500).json(err) : distance(req.query.location, ret, res);
                });
            });
        }
    },

    breweryDetail: function(req, res){
        var location = false,
            search;
        if (req.query.near){location = req.query.near;}
        if(mongoose.Types.ObjectId.isValid(req.params.id)) {
            search = {_id: req.params.id};
        } else {
            search = {name: req.params.id};
        }
            Location
                .findOne(search)
                .deepPopulate('beers.reviews.userId')
                .lean()
                .exec(function (err, resp) {
                    var ret = addReviewCount(resp);
                    err ? res.status(500).json(err) : distance(location, ret, res);
                });
    },

    addBrewery: function (req, res) {
        Location.create(req.body, function(err, resp){
            err ? res.status(500).json(err) : res.status(200).json(resp);
        });
    },

    editBrewery: function (req, res) {
        Location.findByIdAndUpdate(req.params.id, req.body, function(err, resp){
            err ? res.status(500).json(err) : res.status(200).json(resp);
        });
    },

    addBeer: function(req, res) {
        var newBeer = new Beer(req.body),
            saveBeer = newBeer.save(),
            locationBeer = Location.findByIdAndUpdate(req.body.brewery, {$push: {beers: newBeer._id}});
        join(saveBeer, locationBeer, function(beer, location){
            return [beer, location];
        })
            .then(function(resp){
                res.status(200).json(resp);
            })
            .catch(function(err){
                res.status(500).json(err);
            });
    },

    addReview: function(req, res){
        req.body.userId = req.user;
        var newReview = new Review(req.body),
            saveReview = newReview.save(),
            beerUpdate = Beer.findByIdAndUpdate(req.body.beerId, {$push: {reviews: newReview._id}}),
            userUpdate = User.findByIdAndUpdate(req.user, {$push: {reviews: newReview._id}});
        join(saveReview, beerUpdate, userUpdate, function(review, beer, user){
            return [review, beer, user];
        })
            .then(function(resp){
                res.status(200).json(resp);
            })
            .catch(function(err){
                res.status(500).json(err);
            });
    },

    editReview: function (req, res) {
        Review.findById(req.params.id, function(err, resp){
            if (err){
                res.status(200).json(err);
            } else if ((req.user).toString() === (resp.userId).toString()) {
                resp.update({ $set: req.body}, function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
            } else {
                res.status(500).json('Not Auth');
            }
        });
    },

    deleteReview: function (req, res) {
        Review.findById(req.params.id, function(err, resp){
            if (err){
                res.status(200).json(err);
            } else if ((req.user).toString() === (resp.userId).toString()) {
                var reviewRemove = resp.remove();
                var beerRemove = Beer.findByIdAndUpdate(resp.beerId, {$pull:{reviews:req.params.id}});
                var userRemove = User.findByIdAndUpdate(resp.userId, {$pull:{reviews:req.params.id}});
                join(reviewRemove, beerRemove, userRemove, function(user, beer, review){
                    return [user, beer, review];
                })
                    .then(function(resp){
                    res.status(200).json(resp);
                })
                    .catch(function(err){
                        res.statis(500).json(err);
                    });
            } else {
                res.status(500).json('Not Auth');
            }
        });
    }
};