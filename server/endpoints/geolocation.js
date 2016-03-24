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
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    var dist = 7917.5117 * Math.asin(Math.sqrt(a));
    return dist.toFixed(2);
}

var milesToMeters = function (miles) {
    return miles * 1609.34;
};

var makeQuery = function(location, search){
    var query = {
        "loc": {
            $geoNear: {
                $geometry: {type: "Point", coordinates: location},
                $maxDistance: milesToMeters(100)
            }
        }
    };
    if (search){
        _.merge(query, search);
    }
    return query;
};

var makeRegex = function(search){
    return new RegExp('\\w*(' + search + ')\\w*', "ig");
};

var addDistance = function(res, location){
    return _.forEach(res, function (obj, idx) {
        dist = distance(location[1], location[0], obj.loc.coordinates[1], obj.loc.coordinates[0]);
        obj.distance = dist;
    });
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
                .deepPopulate('beers.brewery')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(_.shuffle(_.sampleSize(resp, 5)));
                });
        });
        },

    //if there is no location search without it, we need to search with beer or name, with or without locations
    //so we have 4 possibilites
    getBrewery: function (req, res) {
        var reg;
        req.query = _.omitBy(req.query, _.isEmpty);
        if (req.query.name && !req.query.location) {
            reg = makeRegex(req.query.name);
                    Location.find({name: reg}, function(err, resp){
                        err ? res.status(500).json(err) : res.status(200).json(resp);
                    });
            } else if (req.query.beer && !req.query.location) {
            reg = makeRegex(req.query.beer);
            Beer.find({name: reg}, function(err, resp){
                err ? res.status(500).json(err) : res.status(200).json(resp);
            });
        } else if (req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                reg = makeRegex(req.query.name);
                var distPromise = Location.find(makeQuery(location, {name: reg})).lean();
                distPromise.then(function (resp) {
                    res.status(200).json(addDistance(resp, location));
                });
            });
        } else if (req.query.beer && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                reg = makeRegex(req.query.beer);
                var location = [resp[0].longitude, resp[0].latitude];
                var distPromise = Beer.find(makeQuery(location, {name: reg})).lean();
                distPromise.then(function (resp) {
                    res.status(200).json(addDistance(resp, location));
                });
            });
        } else if (!req.query.beer && !req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                var distPromise = Location.find(makeQuery(location)).lean();
                distPromise.then(function (resp) {
                    res.status(200).json(addDistance(resp, location));
                });
            });
        }
    },

    breweryDetail: function(req, res){
        if(mongoose.Types.ObjectId.isValid(req.params.id)) {
            Location
                .findById(req.params.id)
                .deepPopulate('beers')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
        } else {
            Location
                .findOne({name: req.params.id})
                .deepPopulate('beers.reviews.userId')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
        }
    },

    addBrewry: function (req, res) {
        Location.create(req.body, function(err, resp){
            err ? res.status(500).json(err) : res.status(200).json(resp);
        });
    },

    addBeer: function(req, res) {
        var breweryId = req.body.brewery;
        Beer.create(req.body, function(err, resp){
            if (err) {res.status(500).json(err);} else {
                var beerId = resp._id;
                Location.findByIdAndUpdate(breweryId, {$push: {beers: beerId}}, function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
            }
        });
    },

    addReview: function(req, res){
        Review.create(req.body, function(err, resp){
            var reviewId = resp._id;
            Beer.findByIdAndUpdate(req.body.beerId, {$push: {reviews: reviewId}}, function(err, resp){
                User.findByIdAndUpdate(req.user, {$push: {reviews: reviewId}}, function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
            });
        });
    }
};