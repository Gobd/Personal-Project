angular.module('app').directive('topDir', function () {
return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: './partials/Directives/topDir.html',
      controller: 'searchDirCtrl',
      scope: {brewery: '=', search: '=', beers: '=', showsearch: '=', user: "=", isAuthenticated: "="}
  };
});
