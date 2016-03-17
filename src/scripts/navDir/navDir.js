angular.module('app').directive('navDir', function () {
return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: './partials/navDir.html',
      controller: 'NavbarCtrl',
      scope: {
        brewery: '='
      }
  };
});
