angular.module('app').directive('navDir', function () {
return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: './partials/Directives/navDir.html',
      controller: function($scope, $auth){
        $scope.isAuthenticated = function() {
          return $auth.isAuthenticated();
        };
      }
  };
});
