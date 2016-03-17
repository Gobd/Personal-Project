angular.module('app')
  .controller('homeCtrl', function($scope, locationService) {

  $scope.breweryDetails =  function(brewery){
    console.log(brewery);
  };

});
