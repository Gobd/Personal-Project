angular.module('app')
  .controller('searchDirCtrl', function($scope, locationService, $location) {

    function firstLoadSearch(){
        locationService.getAddressFromCoords().then(function(res){
            $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
            $scope.search = {};
            $scope.search.location = res.data[0].city + ', ' + res.data[0].administrativeLevels.level1short;
            $scope.getBrewery($scope.search);
        });
    }

    if (isEmpty($location.search())) {
        firstLoadSearch();
    } else {
        locationService.getBrewery($location.search()).then(function(res){
          $scope.search = $location.search();
          $scope.brewery = res.data;
        });
      }

    $scope.getBrewery = function(brewery){
      locationService.getBrewery(brewery).then(function(res){
        $scope.brewery = res.data;
      });
    };

    $scope.searchByAddress = function(address){
      locationService.searchByAddress(address).then(function(res){
        $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
      });
    };

    $scope.details = function(brewery){
      console.log(brewery);
    };

    function isEmpty(obj) {
      return (Object.keys(obj).length === 0)
    }

  });
