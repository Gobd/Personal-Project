angular.module('app')
  .controller('homeCtrl', function($scope, locationService) {

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
              console.log(brewery.name + ' added!');
            });
        });
      };

  });
