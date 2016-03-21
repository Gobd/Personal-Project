angular.module('app')
    .controller('addBeer', function($scope, locationService, $stateParams) {

        $scope.addBeer = function(beerToAdd){
            beerToAdd.brewery = $stateParams.id;
            locationService.addBeer(beerToAdd).then(function(res){
                $scope.addedBeer = res.data;
            })
        }

    });
