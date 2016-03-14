angular.module('app')
  .factory('Account', function($http) {
    return {
      getProfile: function() {
        return $http.get('http://localhost:3001/api/me');
      },
      updateProfile: function(profileData) {
        return $http.put('http://localhost:3001/api/me', profileData);
      }
    };
  });
