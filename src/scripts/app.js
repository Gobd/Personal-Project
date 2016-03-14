angular.module('app', ['ngResource', 'ngMessages', 'ngAnimate', 'ui.router', 'satellizer', 'toastr'])

  .config(function($authProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $authProvider.facebook({
      clientId: '1670205403245071'
    });

    $authProvider.google({
      clientId: '696255640250-ha91c7enlsravhptab5c63punfunlh8u.apps.googleusercontent.com'
    });

    $urlRouterProvider.otherwise("/");

    $stateProvider
    .state('home', {
      url: '/',
      controller: 'homeCtrl',
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
