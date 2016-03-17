angular.module('app')
  .service('locationService', function($http, $q, $location) {

    function geolocator() {
      var deferred = $q.defer();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          deferred.resolve(position);
        }, function(error) {
          deferred.reject(error);
        });
      }
      return deferred.promise;
    }

    this.getAddressFromCoords = function() {
      var ret = geolocator().then(function(position) {
        return $http({
          method: 'GET',
          params: {
            lat: position.coords.latitude,
            long: position.coords.longitude
          },
          url: 'http://localhost:3001/getAddress'
        });
      });
      return ret;
    };

    this.searchByAddress = function(address) {
      return $http({
        method: 'GET',
        params: {
          address: address
        },
        url: 'http://localhost:3001/getCoords'
      });
    };

    this.addBrewery = function(brewery) {
      return $http({
        method: 'POST',
        data: brewery,
        url: 'http://localhost:3001/addBrewery'
      });
    };

    this.getBrewery = function(brewery) {
      if (brewery) {
        var url = '?';
        for (var key in brewery) {
          url += key + "=" + brewery[key] + '&';
        }
        $location.url(url.slice(0, url.length - 1));
        return $http({
          method: 'GET',
          params: brewery,
          url: 'http://localhost:3001/getBrewery'
        });
      } else
        return $http({
          method: 'GET',
          params: brewery,
          url: 'http://localhost:3001/getBrewery'
        });
    };

  });
