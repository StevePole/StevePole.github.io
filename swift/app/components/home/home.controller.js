(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$rootScope'];

    function HomeController($rootScope) {
        var vm = this;
        vm.init = init;
        vm.single = true;

        function init() {
            $rootScope.active = "Home";

            vm.section = "a";
        }

        init();
    }
})(window.angular);
