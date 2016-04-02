angular.module('app').directive('breweryDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/breweryDir.html',
        controller: function($scope, locationService){

            var date = new Date();
            $scope.day = date.getDay();

            $scope.editBrewery = function(breweryEdit){
                if (breweryEdit.address) {
                    breweryAdd.loc = {};
                    breweryAdd.loc.coordinates = '';
                    locationService.searchByAddress(breweryAdd.address).then(function (res) {
                        breweryAdd.loc.coordinates = [res.data[0].longitude, res.data[0].latitude];
                        locationService.addBrewery(breweryEdit).then(function (res) {
                            $scope.done = res;
                        });
                    });
                } else {
                    locationService.addBrewery(breweryEdit).then(function(res){
                        $scope.done = res;
                    });
                }
            };


        }
    };
});
