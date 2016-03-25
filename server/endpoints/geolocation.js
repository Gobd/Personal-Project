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
    qs = require('querystring'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    requestExt = require('request-extensible'),
    RequestHttpCache = require('request-http-cache');

var httpRequestCache = new RequestHttpCache({
    max: 1024*51200
});

var request = requestExt({
    extensions: [
        httpRequestCache.extension
    ]
});

function distance(origin, locs, res) {
    var params = {
        units: 'imperial',
        mode: 'driving',
        origins: origin,
        destinations: '',
        key: config.distance
    };
    _.forEach(locs, function(obj){
        params.destinations += obj.address + '|';
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
            res.status(200).json(locs);
        } else {
            res.status(500).json(error);
        }
    });
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
                .lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : distance(req.query.location, (_.shuffle(_.sampleSize(resp, 5))), res);
                });
        });
        },

    getBrewery: function (req, res) {
        var reg;
        req.query = _.omitBy(req.query, _.isEmpty);
        if (req.query.name && !req.query.location) {
            reg = makeRegex(req.query.name);
                    Location.find({name: reg}).lean().exec(function(err, resp){
                        err ? res.status(500).json(err) : res.status(200).json(resp);
                    });
            } else if (req.query.beer && !req.query.location) {
                reg = makeRegex(req.query.beer);
                Beer.find({name: reg}).lean().exec(function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
        } else if (req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                reg = makeRegex(req.query.name);
                Location.find(makeQuery(location, {name: reg})).lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : distance(req.query.location, resp, res);
                });
            });
        } else if (req.query.beer && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                reg = makeRegex(req.query.beer);
                var location = [resp[0].longitude, resp[0].latitude];
                Beer.find(makeQuery(location, {name: reg})).lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : distance(req.query.location, resp, res);
                });
            });
        } else if (!req.query.beer && !req.query.name && req.query.location) {
            geocoder.geocode(req.query.location, function (err, resp) {
                if (err) res.status(500).json(err);
                var location = [resp[0].longitude, resp[0].latitude];
                Location.find(makeQuery(location)).lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : distance(req.query.location, resp, res);
                });
            });
        }
    },

    breweryDetail: function(req, res){
        if(mongoose.Types.ObjectId.isValid(req.params.id)) {
            Location
                .findById(req.params.id)
                .deepPopulate('beers')
                .lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
        } else {
            Location
                .findOne({name: req.params.id})
                .deepPopulate('beers.reviews.userId')
                .lean()
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
        }
    },

    addBrewery: function (req, res) {
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
        req.body.userId = req.user;
        console.log(req.body);
        Review.create(req.body, function(err, resp){
            console.log(resp);
            var reviewId = resp._id;
            Beer.findByIdAndUpdate(req.body.beerId, {$push: {reviews: reviewId}}, function(err, resp){
                User.findByIdAndUpdate(req.user, {$push: {reviews: reviewId}}, function(err, resp){
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                });
            });
        });
    }
};