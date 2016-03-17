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
      var a = 0.5 - c((lat2 - lat1) * p)/2 +
              c(lat1 * p) * c(lat2 * p) *
              (1 - c((lon2 - lon1) * p))/2;

      return 12742 * Math.asin(Math.sqrt(a));
  }

  var milesToMeters = function(miles){
      return miles*1609.34;
  };

module.exports = {

 getAddress: function(req, res, next){
     geocoder.reverse({lat:req.query.lat, lon:req.query.long}, function(err, resp) {
       res.status(200).json(resp);
     });
 },

 getCoords : function(req, res, next){
     geocoder.geocode(req.query.address, function(err, resp) {
       res.status(200).json(resp);
     });
 },

 getBrewery : function(req, res, next){
   var breweryPromise;
   if (Object.keys(req.query).length) {
     breweryPromise = Loc.find({name: req.query.brewery});
     breweryPromise.then(function(resp){
       res.status(200).json(resp);
     });
   } else {
     breweryPromise = Loc.find({});
     breweryPromise.then(function(resp){
       res.status(200).json(resp);
     });
   }
 },

 getDistance : function(req, res, next){
   var locPromise = Loc.findOne({name: "2 row"});
   locPromise.then(function(resp){
     var query = {
         "loc" : { $near :
           {
             $geometry: { type: "Point",  coordinates: resp.loc.coordinates },
             $maxDistance: milesToMeters(5)
           }
        }
     };
     var distPromise = Loc.find(query).lean();
     distPromise.then(function(resp){
       _(resp).forEach(function(obj, idx){
         obj.distance = distance(resp[0].loc.coordinates[0], resp[0].loc.coordinates[1], obj.loc.coordinates[0], obj.loc.coordinates[1]);
         if (idx === resp.length - 1) {
           res.status(200).json(resp);
         }
       });
     });
   });
 },

 addBrewry : function(req, res, next){
   Loc.create(req.body);
   res.status(200).json(req.body);
 }

};
