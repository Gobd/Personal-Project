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
              $scope.brewery = {};
              $scope.search.name = '';
              $scope.search.beer = '';
              $scope.getBrewery($scope.search);
          };
          $scope.getBrewery = function(brewery){
              locationService.getBrewery(brewery).then(function(res){
                  $scope.brewery = res.data;
              });
          };
      }
  };
});
