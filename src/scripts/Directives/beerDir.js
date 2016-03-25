angular.module('app').directive('beerDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/beerDir.html'
    };
});
