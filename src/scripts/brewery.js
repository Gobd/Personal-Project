angular.module('app')
  .controller('addBrewery', function($scope, locationService, $rootScope) {
      $rootScope.showsearchscope = false;

      $scope.addBrewery = function(breweryAdd){
        breweryAdd.loc = {};
        breweryAdd.loc.coordinates = '';
        locationService.searchByAddress(breweryAdd.address).then(function(res){
            breweryAdd.loc.coordinates = [res.data[0].longitude, res.data[0].latitude];
            locationService.addBrewery(breweryAdd).then(function(res){
              $scope.addedBrewery = res;
              $scope.brewery = {};
            });
        });
      };

  });
