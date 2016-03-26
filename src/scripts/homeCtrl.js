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

        $scope.ratings = [
        {rating:1, isActive: true},
        {rating:2, isActive: false},
        {rating:3, isActive: false},
        {rating:4, isActive: false},
        {rating:5, isActive: false},
            1
        ];
        
        $scope.ratingFunc = function(idx){
            $scope.ratings[6] = idx;
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

});
