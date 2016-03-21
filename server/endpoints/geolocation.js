var geocoderProvider = 'google',
    httpAdapter = 'https',
    config = require('../config'),
    extra = {apiKey: config.maps},
    geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra),
    Loc = require('../models/location.js'),
    _ = require('lodash'),
    beer = require('../models/beer.js'),
    beerModel = beer.model,
    beerSchema = beer.schema,
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    config = require('../config'),
    User = require('../models/user.js'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    jwt = require('jwt-simple');

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
        geocoder.geocode(req.query.location, function (err, resp) {
            res.status(200).json(resp);
        });
    },

    getBrewery: function (req, res, next) {
        if (req.query.name) {
            geocoder.geocode(req.query.location, function (err, resp) {
                var location = [resp[0].longitude, resp[0].latitude];
                var distPromise = Loc.find({name: req.query.name}).lean();
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
                var distPromise = Loc.find(query).lean();
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
            Loc
                .findById(req.params.id)
                .deepPopulate('beers')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                })
        } else {
            Loc
                .findOne({name: req.params.id})
                .deepPopulate('beers.reviews.userId')
                .exec(function (err, resp) {
                    err ? res.status(500).json(err) : res.status(200).json(resp);
                })
        }
    },

    addBrewry: function (req, res, next) {
        Loc.create(req.body);
        res.status(200).json(req.body);
    },

    addBeer: function(req, res, next) {
        var breweryId = req.body.brewery;
        beerModel.create(req.body, function(err, resp){
            if (err) {res.status(500).json(err)} else {
                var beerId = resp._id;
                Loc.findByIdAndUpdate(breweryId, {$push: {beers: beerId}}, function(err, resp){
                    res.status(200).json(resp);
                })
            }
        });
    },

    addReview: function(req, res, next){
        var token = req.header('Authorization').split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);
        req.body.userId = payload.sub;
        beerModel.findByIdAndUpdate(req.body.beerId, {$push: {reviews: req.body}}, function(err, resp){
            err ? res.status(500).json(err) : res.status(200).json(resp);
        })
    }
};