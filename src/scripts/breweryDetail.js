angular.module('app')
    .controller('breweryDetail', function($scope, locationService, $stateParams, $rootScope, detail) {
        $rootScope.showsearchscope = false;

        $scope.detail = detail;

        $scope.addBeer = function(beerToAdd){
            beerToAdd.brewery = $scope.detail._id;
            beerToAdd.address = $scope.detail.address;
            beerToAdd.loc = $scope.detail.loc;
            $scope.detail.beers.push(beerToAdd);
            locationService.addBeer(beerToAdd).then(function(res){
                $scope.addedBeer = res.data;
            });
        };



    });
