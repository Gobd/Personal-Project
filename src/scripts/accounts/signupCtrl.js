angular.module('app')
  .controller('signupCtrl', function($scope, $location, $auth, toastr, $rootScope) {
      $rootScope.showsearchscope = false;
      $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $location.path('/');
          toastr.info('You have successfully created a new account and have been signed-in');
        })
        .catch(function(response) {
          toastr.error(response.data.message);
        });
    };
  });
