angular.module('app')
  .service('locationFinder', function($http, $q) {

    function geolocator(){
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                        deferred.resolve(position);
                }, function (error) {
                        deferred.reject(error);
                });
            }
            return deferred.promise;
        }

        this.getAddressFromCoords = function(){
          var ret = geolocator().then(function(position){
            return $http({
              method: 'GET',
              params: {lat: position.coords.latitude,
                      long: position.coords.longitude},
              url: 'http://localhost:3001/getAddress'
            });
          });
          return ret;
        };

        this.searchByAddress = function(address){
          return $http({
            method: 'GET',
            params: {address: address},
            url: 'http://localhost:3001/getCoords'
          });
        };

  });
