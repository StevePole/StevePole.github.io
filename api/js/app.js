'use strict';

/* App Module */
angular.module('apis-application.controllers', []);
angular.module('apis-application.services', []);
angular.module('apis-application.directives', []);
angular.module('apis-application.filters', []);

var apisApp = angular.module('apis-application', [
    'ngRoute',
    'ngSanitize',
    'apis-application.controllers',
    'apis-application.services',
    'apis-application.directives',
    'apis-application.filters'
]);

/**
apis-application.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/apis', {
            templateUrl: 'templates/directory.html',
            controller: 'DirectoryCtrl'
        }).
        when('/apis/:apiId/docs', {
            templateUrl: 'templates/docs.html',
            controller: 'DocsCtrl'
        }).
        when('/apis/:apiId/methods/:method', {
            templateUrl: 'templates/docs-docs.html',
            controller: 'DocsCtrl'
        }).
        when('/apis/:apiId/models/:model', {
            templateUrl: 'templates/docs-docs.html',
            controller: 'DocsCtrl'
        }).
        when('/apis/:apiId/design', {
            templateUrl: 'templates/designer.html',
            controller: 'DesignerCtrl'
        }).
        when('/apis/:apiId/console', {
            templateUrl: 'templates/console.html',
            controller: 'ConsoleCtrl'
        }).
        when('/users', {
            templateUrl: 'templates/users.html',
            controller: 'UsersCtrl'
        }).
        otherwise({
            redirectTo: '/apis'
        });
    }
]);
/**/

apisApp.config(['$locationProvider', function ($locationProvider) {
    //commenting out this line (switching to hashbang mode) breaks the app
    //-- unless # is added to the templates
    //$locationProvider.html5Mode(true);

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
}]);
/**/
