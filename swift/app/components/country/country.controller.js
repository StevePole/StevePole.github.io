(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('CountryController', CountryController);

    CountryController.$inject = [
        '$rootScope', '$routeParams', 'CountriesService', 'BanksService'
    ];

    function CountryController($rootScope, $routeParams, CountriesService, BanksService) {
        var vm = this;
        vm.init = init;
        vm.country = {};
        vm.countries = [];
        vm.single = true;

        function init() {
            $rootScope.active = "Countries";
            var countryId = $routeParams.country;

            CountriesService.get(countryId)
                .then(function(country) {
                    vm.country = country;
                    return country;
                });


            CountriesService.list()
                .then(function(countries) {
                    vm.countries = countries;
                    return countries;
                });

            BanksService.getByCountry(countryId)
                .then(function(banks) {
                    vm.banks = banks;
                    return banks;
                });
        }

        init();
    }
})(window.angular);
