angular.module('app')
  .controller('NavbarCtrl', function($scope, $auth, locationService) {

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    // locationService.getAddressFromCoords().then(function(res){
    //   $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
    //   $scope.search = {};
    //   $scope.search.location = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
    // });

    $scope.getBrewery = function(brewery){
      locationService.getBrewery(brewery).then(function(res){
        $scope.brewery = res.data;
      });
    };

    $scope.searchByAddress = function(address){
      locationService.searchByAddress(address).then(function(res){
        $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      });
    };

    $scope.details = function(brewery){
      console.log(brewery);
    };

    if (!$scope.results){
      locationService.getBrewery().then(function(res){
        $scope.brewery = res.data;
      });
    }

  });
