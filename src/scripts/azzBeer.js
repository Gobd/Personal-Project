angular.module('app')
    .controller('addBeer', function($scope, locationService) {

        $scope.addBeer = function(beerToAdd){
            locationService.addBeer(beerToAdd).then(function(res){
                $scope.addedBeer = res.data;
            })
        }

    });
