angular.module('app', ['ngResource', 'ngMessages', 'ngAnimate', 'ui.router', 'satellizer', 'toastr', 'ngMaterial'])

  .config(function($authProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

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
            url: '/breweryDetail/:id',
            controller: 'breweryDetail',
            templateUrl: 'partials/breweryDetail.html'
        })
        .state('addBeer', {
            url: '/addBeer/:id',
            controller: 'addBeer',
            templateUrl: 'partials/addBeer.html'
        })
      .state('reviewBeer', {
          url: '/reviewBeer/:id',
          controller: 'reviewBeer',
          templateUrl: 'partials/reviewBeer.html'
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
