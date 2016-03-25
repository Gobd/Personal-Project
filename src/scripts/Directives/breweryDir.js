angular.module('app').directive('breweryDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/breweryDir.html'
    };
});
