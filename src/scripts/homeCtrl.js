angular.module('app')
  .controller('homeCtrl', function($scope, locationFinder) {

      // locationFinder.getAddressFromCoords().then(function(res){
      //   $scope.address = res.data;
      // });

      $scope.searchByAddress = function(address){
        locationFinder.searchByAddress(address).then(function(res){
          $scope.coords = res.data;
        });
      };

  });
