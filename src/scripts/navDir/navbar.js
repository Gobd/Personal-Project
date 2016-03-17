angular.module('app')
  .controller('NavbarCtrl', function($scope, $auth, locationService, $location, $rootScope) {

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    locationService.getAddressFromCoords().then(function(res){
      $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      if (!$scope.search) {$scope.search = {};}
      $scope.search.location = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
    });

    $rootScope.$on('$locationChangeSuccess', function () {
        if (!isEmpty($location.search())) {
            locationService.getBrewery($location.search()).then(function(res){
              $scope.brewery = res.data;
            });
        } else {
          locationService.getBrewery().then(function(res){
            $scope.search = {};
            $scope.brewery = res.data;
          });
        }
    });

    if (isEmpty($location.search())) {
        locationService.getBrewery().then(function(res){
          $scope.brewery = res.data;
        });
    } else {
        locationService.getBrewery($location.search()).then(function(res){
          $scope.search = $location.search();
          $scope.brewery = res.data;
        });
      }

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

    function isEmpty(obj) {
      if (Object.keys(obj).length === 0) {return true;} else {return false;}
    }

  });
