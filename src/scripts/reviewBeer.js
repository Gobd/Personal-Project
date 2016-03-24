angular.module('app')
    .controller('reviewBeer', function($scope, locationService, $stateParams, $rootScope) {

        $rootScope.showsearchscope = false;
    $scope.reviewBeer = function(beerReview){
        beerReview.beerId = $stateParams.id;
        locationService.beerReview(beerReview).then(function(res){
            $scope.detail = res.data;
        });
    }

    });
