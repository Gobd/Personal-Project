angular.module('app')
  .controller('NavbarCtrl', function($scope, $auth, locationService, $document) {

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    locationService.getAddressFromCoords().then(function(res){
      $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      $scope.search = {};
      $scope.search.location = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
    });

    $scope.searchDb = function(){

    };

  });
