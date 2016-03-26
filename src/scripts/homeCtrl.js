angular.module('app')
  .controller('homeCtrl', function($scope, $rootScope) {
      $rootScope.showsearchscope = true;

      $scope.ratingDisp = function(rat){
          var ret = [];
          for (var i = 1; i <= Math.round(rat); i++) {
              if (rat % 1 === 0){
                  ret.push({half:false});
              } else if (i < rat) {
                      ret.push({half:false});
                  } else {
                      ret.push({half: true});
                  }
          }
          return ret;
      };

      $scope.disp = $scope.ratingDisp(3.7);

});
