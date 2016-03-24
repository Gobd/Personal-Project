angular.module('app')
  .controller('searchDirCtrl', function($scope, locationService, $location, $auth, Account) {

      $scope.isAuthenticated = function() {
          return $auth.isAuthenticated();
      };

      $scope.goHome = function(){
          $location.search({});
          $scope.search = {};
          $scope.brewery = {};
          search();
      };

    function search(){
        // $scope.brewery = [1,2,3];
        if($scope.isAuthenticated() && isEmpty($location.search())){
            Account.getProfile()
                .then(function(response) {
                    $scope.user = response.data;
                    if ($scope.user.home){
                        locationService.getRand({location: $scope.user.home}).then(function(res){
                            $scope.search = {};
                            $scope.search.location = $scope.user.home;
                            $scope.brewery = res.data;
                            $scope.beers = [];
                            $scope.beers.push('true');
                            $scope.brewery.forEach(function(brewery){
                                brewery.beers.forEach(function(beer){
                                    $scope.beers.push(beer);
                                })
                            });
                            delete $scope.brewery.beers;
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
            $scope.search = {};
            $scope.search.location = 'Searching...';
            locationService.getAddressFromCoords().then(function(res){
                $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
                $scope.search = {};
                $scope.search.location = res.data[0].formattedAddress;
                locationService.getRand($scope.search).then(function(res){
                    $scope.brewery = res.data;
                    $scope.beers = [];
                    $scope.beers.push('true');
                    $scope.brewery.forEach(function(brewery){
                        brewery.beers.forEach(function(beer){
                            $scope.beers.push(beer);
                        })
                    });
                });
            });
        }
    }

      search();

      $scope.getBrewery = function(search){
          $scope.brewery = 'stuff';
          locationService.getBrewery(search).then(function(res){
              $scope.brewery = res.data;
          });
      };
      
    $scope.nearMe = function(){
        $scope.brewery = {};
        $scope.search = {};
        $scope.search.location = 'Searching...';
        $location.search({});
        $scope.beers[0] = false;
        locationService.getAddressFromCoords().then(function(res){
            $scope.coords = {lat: res.data[0].latitude, lon: res.data[0].longitude};
            $scope.search = {};
            $scope.search.location = res.data[0].formattedAddress;
            locationService.getBrewery($scope.search).then(function(res){
                $scope.brewery = res.data;
            });
        });
    };

    function isEmpty(obj) {
      return (Object.keys(obj).length === 0)
    }

  });
