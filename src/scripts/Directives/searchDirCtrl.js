angular.module('app')
  .controller('searchDirCtrl', function($scope, locationService, $location, $auth, Account) {

      $scope.isAuthenticated = function() {
          return $auth.isAuthenticated();
      };

    if($scope.isAuthenticated() && isEmpty($location.search())){
            Account.getProfile()
                .then(function(response) {
                    $scope.user = response.data;
                    if ($scope.user.home){
                        locationService.getBrewery({location: $scope.user.home}).then(function(res){
                            $scope.search = {};
                            $scope.search.location = $scope.user.home;
                            $scope.brewery = res.data;
                        });
                    } else {
                        locationService.getAddressFromCoords().then(function(res){
                            $scope.search = {};
                            $scope.search.location = res.data[0].formattedAddress;
                            locationService.addHome({userId: $scope.user._id,home: res.data[0].formattedAddress}).then(function(resp){
                                $scope.brewery = resp.data;
                            })
                        })
                    }
                })
    } else if (!isEmpty($location.search())) {
        locationService.getBrewery($location.search()).then(function(res){
            $scope.search = $location.search();
            $scope.brewery = res.data;
        })
    } else {
        locationService.getAddressFromCoords().then(function(res){
            $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
            $scope.search = {};
            $scope.search.location = res.data[0].formattedAddress;
            $scope.getBrewery($scope.search);
        });
    }
      
    $scope.getBrewery = function(brewery){
      locationService.getBrewery(brewery).then(function(res){
        $scope.brewery = res.data;
      });
    };
    //
    // $scope.searchByAddress = function(address){
    //   locationService.searchByAddress(address).then(function(res){
    //     $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
    //   });
    // };

    function isEmpty(obj) {
      return (Object.keys(obj).length === 0)
    }

  });
