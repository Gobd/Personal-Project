angular.module('app').directive('searchDir', function () {
return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: './partials/Directives/searchDir.html',
      controller: 'searchDirCtrl',
      scope: {
        brewery: '='
      }
  };
});
