var geocoderProvider = 'google',
  httpAdapter = 'https',
  config = require('../config'),
  extra = {
    apiKey: config.maps
  },
  geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

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
 }

};
