(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('CountriesController', CountriesController);

    CountriesController.$inject = ['$rootScope', '$routeParams', 'CountriesService'];

    function CountriesController($rootScope, $routeParams, CountriesService) {
        var vm = this;
        vm.init = init;
        vm.countries = [];

        function init() {
            $rootScope.active = "Countries";

            vm.search = $routeParams.search;

            CountriesService.list(vm.search)
                .then(function(countries) {
                    vm.countries = countries;
                    return countries;
                });
        }

        init();
    }
})(window.angular);
