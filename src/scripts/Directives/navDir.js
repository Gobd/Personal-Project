angular.module('app').directive('navDir', function () {
return {
      restrict: 'AE',
      replace: 'true',
      scope: {brewery: '=', search: '='},
      templateUrl: './partials/Directives/navDir.html',
      controller: function($scope, $auth, locationService){
            $scope.isAuthenticated = function() {
              return $auth.isAuthenticated();
            };
          $scope.goHome = function(){
                  locationService.getAddressFromCoords().then(function(res){
                      $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
                      $scope.search = {};
                      $scope.search.location = res.data[0].formattedAddress;
                      $scope.getBrewery($scope.search);
                  });
          };
          $scope.getBrewery = function(brewery){
              locationService.getBrewery(brewery).then(function(res){
                  $scope.brewery = res.data;
              });
          };
      }
  };
});
