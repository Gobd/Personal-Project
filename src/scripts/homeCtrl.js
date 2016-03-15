angular.module('app')
  .controller('homeCtrl', function($scope, locationService) {

      // locationService.getAddressFromCoords().then(function(res){
      //   $scope.respCoords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      //   $scope.address = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
      // });

      $scope.searchByAddress = function(address){
        locationService.searchByAddress(address).then(function(res){
          $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
        });
      };

      $scope.add = function(brewery){
        brewery.loc = {};
        brewery.loc.coordinates = '';
        locationService.searchByAddress(brewery.address).then(function(res){
            brewery.loc.coordinates = [res.data[0].longitude, res.data[0].latitude];
            locationService.addBrewery(brewery).then(function(res){
            });
        });
      };

  });
