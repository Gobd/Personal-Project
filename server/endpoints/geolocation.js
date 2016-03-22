var geocoderProvider = 'google',
    httpAdapter = 'https',
    config = require('../config'),
    extra = {apiKey: config.maps},
    geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra),
    Location = require('../models/location.js'),
    _ = require('lodash'),
    BeerConfig = require('../models/beer.js'),
    Beer = BeerConfig.model,
    ReviewConfig = require ('../models/review.js'),
    Review = ReviewConfig.model,
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    User = require('../models/user.js'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 7917.5117 * Math.asin(Math.sqrt(a));
}

var milesToMeters = function (miles) {
    return miles * 1609.34;
};

module.exports = {

    getAddress: function (req, res, next) {
        geocoder.reverse({lat: req.query.lat, lon: req.query.long}, function (err, resp) {
            res.status(200).json(resp);
        });
    },

    getCoords: function (req, res, next) {
        geocoder.geocode(req.query.address, function (err, resp) {
            res.status(200).json(resp);
        });
    },

    getRand: function(req, res, next){
        geocoder.geocode(req.query.location, function (err, resp) {
            var location = [resp[0].longitude, resp[0].latitude];
            var query = {
                "loc": {
                    $near: {
                        $geometry: {type: "Point", coordinates: location},
                        $maxDistance: milesToMeters(100)
                    }
                }
            };
            Location
                .find(query)
                .deepPopulate('beers.brewery')
                .exec(function (err, resp) {
                    var arr = [];
                    var ret = [];
                    while(arr.length < 5) {
                        var rand = Math.floor(Math.random()*resp.length);
                        if (arr.indexOf(rand) === -1) {
                            arr.push(rand);
                        }
                    }
                    _(arr).forEach(function(obj, idx){
                        ret.push(resp[obj]);
                        if (idx === arr.length - 1) {
                            res.status(200).json(ret);
                        }
                    })
                    });
                })
        },

    //if there is no location search without it, we need to search with beer or name, with or without locations
    //so we have 4 possibilites
    getBrewery: function (req, res, next) {
        for (var key in req.query){
            if(req.query[key].length === 0) {
                delete req.query[key]
            }
        }
        if (req.query.name) {
            geocoder.geocode(req.query.location, function (err, resp) {
                var location = [resp[0].longitude, resp[0].latitude];
                var distPromise = Location.find({name: req.query.name}).lean();
                distPromise.then(function (resp) {
                    if (Object.keys(resp).length === 0) {
                        res.status(200).json({none: true});
                    } else {
                        _(resp).forEach(function (obj, idx) {
                            dist = distance(location[1], location[0], obj.loc.coordinates[1], obj.loc.coordinates[0]);
                            obj.distance = dist.toFixed(2);
                            if (idx === resp.length - 1) {
                                res.status(200).json(resp);
                            }
                        });
                    }
                });
            });
        } else if (req.query.beer) {
                geocoder.geocode(req.query.location, function (err, resp) {
                    var location = [resp[0].longitude, resp[0].latitude];
                    var distPromise = Beer.find({name: req.query.beer}).lean();
                    distPromise.then(function (resp) {
                        if (Object.keys(resp).length === 0) {
                            res.status(200).json({none: true});
                        } else {
                            _(resp).forEach(function (obj, idx) {
                                dist = distance(location[1], location[0], obj.loc.coordinates[1], obj.loc.coordinates[0]);
                                obj.distance = dist.toFixed(2);
                                if (idx === resp.length - 1) {
                                    res.status(200).json(resp);
                                }
                            });
                        }
                    });
                });
        } else {
            geocoder.geocode(req.query.location, function (err, resp) {
                var location = [resp[0].longitude, resp[0].latitude];
                var query = {
                    "loc": {
                        $near: {
                            $geometry: {type: "Point", coordinates: location},
                            $maxDistance: milesToMeters(100)
                        }
                    }
                };
                var distPromise = Location.find(query).lean();
                distPromise.then(function (resp) {
                    _(resp).forEach(function (obj, idx) {
                        dist = distance(location[1], location[0], obj.loc.coordinates[1], obj.loc.coordinates[0]);
                        obj.distance = dist.toFixed(2);
                        if (idx === resp.length - 1) {
                            res.status(200).json(resp);
                        }
                    });
                });
            });
        }
    },

    breweryDetail: function(req, res, next){
        if(mongoose.Types.ObjectId.isValid(req.params.id)) {
            Location
                .findById(req.params.id)
                .deepPopulate('beers')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                })
        } else {
            Location
                .findOne({name: req.params.id})
                .deepPopulate('beers.reviews.userId')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                })
        }
    },

    addBrewry: function (req, res, next) {
        Location.create(req.body);
        res.status(200).json(req.body);
    },

    addBeer: function(req, res, next) {
        var breweryId = req.body.brewery;
        Beer.create(req.body, function(err, resp){
            if (err) {res.status(500).json(err)} else {
                var beerId = resp._id;
                Location.findByIdAndUpdate(breweryId, {$push: {beers: beerId}}, function(err, resp){
                    res.status(200).json(resp);
                })
            }
        });
    },

    addReview: function(req, res, next){
        Review.create(req.body, function(err, resp){
            var reviewId = resp._id;
            Beer.findByIdAndUpdate(req.body.beerId, {$push: {reviews: reviewId}}, function(err, resp){
                User.findByIdAndUpdate(req.user, {$push: {reviews: reviewId}}, function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                })
            })
        });
    }
};