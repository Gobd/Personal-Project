angular.module('app')
    .controller('addBeer', function($scope, locationService, $stateParams, $rootScope) {
        $rootScope.showsearchscope = false;

        $scope.addBeer = function(beerToAdd){
            beerToAdd.brewery = $stateParams.id;
            locationService.addBeer(beerToAdd).then(function(res){
                $scope.addedBeer = res.data;
            })
        }

    });
