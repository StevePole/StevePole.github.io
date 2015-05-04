
(function(angular) {
    angular.module('swift-app.controllers', []);
    angular.module('swift-app.services', []);
    angular.module('swift-app.directives', []);
    angular.module('swift-app.filters', []);
    angular.module('swift-app.mocks', []);

    angular.module('swift-app', [
        'ngRoute',
        'ngAnimate',
        'swift-app.controllers',
        'swift-app.directives',
        'swift-app.filters',
        'swift-app.services'
    ]);
})(window.angular);

(function(angular) {
    'use strict';

    // route-config.js
    angular
        .module('swift-app')
        .config(config);

    function config($routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'templates/home.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            .when('/directory', {
                redirectTo: '/directory/u'
            })
            .when('/directory/:search', {
                templateUrl: 'templates/countries.html',
                controller: 'CountriesController',
                controllerAs: 'vm'
            })/*
            .when('/countries', {
                templateUrl: 'templates/countries.html',
                controller: 'CountriesController',
                controllerAs: 'vm'
            })*/
            .when('/countries/:country', {
                templateUrl: 'templates/country.html',
                controller: 'CountryController',
                controllerAs: 'vm'
            })
            .when('/banks', {
                templateUrl: 'templates/banks.html',
                controller: 'BanksController',
                controllerAs: 'vm'
            })
            .when('/banks/:bank', {
                templateUrl: 'templates/bank.html',
                controller: 'BankController',
                controllerAs: 'vm'
            })/*
            .when('/countries/:country/banks', {
                templateUrl: 'templates/banks.html',
                controller: 'BanksController',
                controllerAs: 'vm'
            })*/
            .when('/swift-codes', {
                templateUrl: 'templates/codes.html',
                controller: 'CodesController',
                controllerAs: 'vm'
            })
            .when('/swift-codes/:code', {
                templateUrl: 'templates/code.html',
                controller: 'CodeController',
                controllerAs: 'vm'
            })
            .when('/countries/:country/banks/:bank', {
                templateUrl: 'templates/bank.html',
                controller: 'BankController',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: 'home'
            });
    }
})(window.angular);
