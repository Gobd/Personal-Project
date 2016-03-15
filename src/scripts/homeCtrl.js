angular.module('app')
  .controller('homeCtrl', function($scope, locationService) {

      // locationService.getAddressFromCoords().then(function(res){
      //   $scope.respCoords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      //   $scope.address = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
      // });
      //
      // $scope.searchByAddress = function(address){
      //   locationService.searchByAddress(address).then(function(res){
      //     $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      //   });
      // };

  });
