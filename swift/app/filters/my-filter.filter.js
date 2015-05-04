(function() {
    'use strict';
    
    angular
        .module('swift-app.filters')
        .filter('myFilter', myFilter);

    function myFilter() {
        return function(input) {
            return input.toUpperCase();
        };
    }
})();