angular.module('app').directive('beerDir', function () {
    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: './partials/Directives/beerDir.html',
        controller: function($scope, $stateParams, locationService){

            $scope.ratings = [
                {rating:1, isActive: true},
                {rating:2, isActive: false},
                {rating:3, isActive: false},
                {rating:4, isActive: false},
                {rating:5, isActive: false},
                1
            ];

            $scope.ratingFunc = function(idx){
                $scope.ratings[5] = idx+1;
                for (var i = 1; i < $scope.ratings.length-1; i++) {
                    if (i <= idx) {
                        if (!$scope.ratings[i].isActive) {
                            $scope.ratings[i].isActive = true;
                        }
                    } else {
                        $scope.ratings[i].isActive = false;
                    }
                }
            };

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
                beerReview.rating = $scope.ratings[5];
                locationService.beerReview(beerReview).then(function(res){
                   var idx = $scope.beer.reviews.indexOf(beer._id);
                    $scope.beer.reviews.push(beerReview);
                });
            };

        }
    };
});
