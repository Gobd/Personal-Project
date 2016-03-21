angular.module('app')
    .controller('reviewBeer', function($scope, locationService, $stateParams) {

    $scope.reviewBeer = function(beerReview){
        beerReview.beerId = $stateParams.id;
        locationService.beerReview(beerReview).then(function(res){
            $scope.detail = res.data;
        });
    }

    });
