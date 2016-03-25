angular.module('app').directive('beerDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/beerDir.html',
        controller: function($scope, $stateParams, locationService){

            $scope.addBeer = function(beerToAdd){
                console.log(beerToAdd);
                beerToAdd.brewery = $stateParams.id;
                locationService.addBeer(beerToAdd).then(function(res){
                    $scope.addedBeer = res.data;
                });
            };

            $scope.reviewBeer = function(beerReview, beer){
                beerReview.beerId = beer._id;
                beerReview.userId = {};
                beerReview.userId.displayName = $scope.user.displayName;
                locationService.beerReview(beerReview).then(function(res){
                   var idx = $scope.beer.reviews.indexOf(beer._id);
                    $scope.beer.reviews.push(beerReview);
                });
            };

        }
    };
});
