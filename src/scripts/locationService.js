angular.module('app')
  .service('locationService', function($http, $q, $location) {

    function geoLocation() {
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

      this.getRand = function(location){
          return $http({
              method: 'GET',
              params: location,
              url: 'http://localhost:3001/getRand'
          });
      };

      this.addHome = function(home){
          return $http({
              method: 'POST',
              data: home,
              url: 'http://localhost:3001/addHome'
          });
      };

    this.getAddressFromCoords = function() {
      return geoLocation().then(function(position) {
        return $http({
          method: 'GET',
          params: {
            lat: position.coords.latitude,
            long: position.coords.longitude
          },
          url: 'http://localhost:3001/getAddress'
        });
      });
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

      this.addBeer = function(beerToAdd) {
          return $http({
              method: 'POST',
              data: beerToAdd,
              url: 'http://localhost:3001/addBeer'
          });
      };

      this.breweryDetail = function(brewery) {
          var url;
          if (brewery.near) {url = 'http://localhost:3001/breweryDetail/' + brewery.id + '?near=' + brewery.near;} else {url = 'http://localhost:3001/breweryDetail/' + brewery.id;}
          return $http({
              method: 'GET',
              url: url
          });
      };

    this.getBrewery = function(brewery) {
      if (brewery) {
          console.log('hey')
          $location.url("/home").search(brewery);
        return $http({
          method: 'GET',
          params: brewery,
          url: 'http://localhost:3001/getBrewery'
        });
      } else
        return $http({
          method: 'GET',
          url: 'http://localhost:3001/getBrewery'
        });
    };

      this.beerReview = function(beerReview){
          return $http({
              method: 'POST',
              data: beerReview,
              url: 'http://localhost:3001/review'
          });
      };

  });
