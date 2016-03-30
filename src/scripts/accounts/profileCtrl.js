angular.module('app')
  .controller('profileCtrl', function($scope, $auth, toastr, Account, locationService) {
      $scope.showsearchscope = false;

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

      $scope.getProfile = function() {
      Account.getProfile()
        .then(function(response) {
          $scope.user = response.data;
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.updateProfile = function() {
      Account.updateProfile($scope.user)
        .then(function() {
          toastr.success('Profile has been updated');
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function() {
          toastr.success('You have successfully linked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          toastr.info('You have unlinked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          toastr.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
        });
    };

    $scope.getProfile();

      $scope.editReview = function(editedReview, id){
          locationService.editReview(editedReview, id);
      };

      $scope.deleteReview = function(review){
          locationService.deleteReview(review);
      };

  });
