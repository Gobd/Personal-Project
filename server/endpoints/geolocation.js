var geocoderProvider = 'google',
    httpAdapter = 'https',
    config = require('../config'),
    extra = {apiKey: config.maps},
    geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra),
    Loc = require('../models/location.js'),
    _ = require('lodash')
    , mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

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
        Loc.findById(req.params.id, function(err, resp){
            res.status(200).json(resp);
        })
    },

    addBrewry: function (req, res, next) {
        Loc.create(req.body);
        res.status(200).json(req.body);
    }

};
