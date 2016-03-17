angular.module('app').directive('navDir2', function () {
return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: './partials/navDir2.html',
      controller: 'NavbarCtrl'
  };
});
