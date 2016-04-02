angular.module('app', ['ngResource', 'ngMessages', 'ngAnimate', 'ui.router', 'satellizer', 'toastr', 'ngMaterial'])

    .filter('split', function() {
        return function (input) {
            var str = input.split(",");
            var ret = str[0] + "," + str[1];
            return ret;
        };
    })

  .config(function($authProvider, $stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider) {


      $mdThemingProvider.theme('default').foregroundPalette[3] = "rgba(23,62,67,1)";

      var indigo = $mdThemingProvider.extendPalette('indigo', {
          '500': '173e43'
      });
      $mdThemingProvider.definePalette('indigo', indigo);

      var indigo = $mdThemingProvider.extendPalette('red', {
          '500': '173e43'
      });
      $mdThemingProvider.definePalette('red', indigo);

      $mdThemingProvider.theme('default').primaryPalette('indigo').warnPalette('red');

      $mdThemingProvider.theme('default').foregroundPalette[3] = "rgba(66,66,66,1)";


      $authProvider.facebook({
      clientId: '1670205403245071'
    });

    $authProvider.google({
      clientId: '696255640250-ha91c7enlsravhptab5c63punfunlh8u.apps.googleusercontent.com'
    });

    $urlRouterProvider.otherwise("/home");

    $stateProvider
    .state('home', {
      url: '/home:name?/:beer?/:near?',
      controller: 'homeCtrl',
        notify: false,
      templateUrl: 'partials/home.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'loginCtrl',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'signupCtrl',
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    })
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'logoutCtrl'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'profileCtrl',
      resolve: {
        loginRequired: loginRequired
      }
    })
    .state('addBrewery', {
      url: '/addBrewery',
      controller: 'addBrewery',
      templateUrl: 'partials/addBrewery.html'
    })
        .state('breweryDetail', {
            url: '/breweryDetail/:id?near',
            controller: 'breweryDetail',
            templateUrl: 'partials/breweryDetail.html',
            resolve: {
                detail: function(locationService, $stateParams){
                    return locationService.breweryDetail($stateParams).then(function(res){
                        return res.data;
                    });
                }
            }
        });

      function skipIfLoggedIn($q, $auth) {
          var deferred = $q.defer();
          if ($auth.isAuthenticated()) {
            deferred.reject();
          } else {
            deferred.resolve();
          }
          return deferred.promise;
      }

      function loginRequired($q, $location, $auth) {
          var deferred = $q.defer();
          if ($auth.isAuthenticated()) {
            deferred.resolve();
          } else {
            $location.path('/login');
          }
          return deferred.promise;
      }

  });
