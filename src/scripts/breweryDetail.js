angular.module('app')
    .controller('breweryDetail', function($scope, locationService, $stateParams, $rootScope) {
        $rootScope.showsearchscope = false;

        locationService.breweryDetail($stateParams.id).then(function(res){
            $scope.detail = res.data;
        });

        $scope.addBeer = function(beerToAdd){
            beerToAdd.brewery = $scope.detail._id;
            beerToAdd.loc = $scope.detail.loc;
            locationService.addBeer(beerToAdd).then(function(res){
                $scope.addedBeer = res.data;
            })
        }

    });
