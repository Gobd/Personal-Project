angular.module('app').directive('breweryDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/breweryDir.html',
        controller: function($scope, locationService){

            var date = new Date();
            $scope.day = date.getDay();
            $scope.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            $scope.editBrewery = function(breweryEdit, id){
                    locationService.editBrewery(breweryEdit, id).then(function(res){
                        $scope.done = res;
                    });
            };
        }
    };
});
