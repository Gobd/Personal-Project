angular.module('app')
    .controller('breweryDetail', function($scope, locationService, $stateParams) {

        locationService.breweryDetail($stateParams.id).then(function(res){
            $scope.detail = res.data;
        });

    });
