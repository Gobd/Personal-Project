angular.module('app')
  .controller('addBrewery', function($scope, locationService) {

      $scope.addBrewery = function(brewery){
        brewery.loc = {};
        brewery.loc.coordinates = '';
        locationService.searchByAddress(brewery.address).then(function(res){
            brewery.loc.coordinates = [res.data[0].longitude, res.data[0].latitude];
            locationService.addBrewery(brewery).then(function(res){
              $scope.addedBrewery = res;
              $scope.brewery = {};
            });
        });
      };

  });
