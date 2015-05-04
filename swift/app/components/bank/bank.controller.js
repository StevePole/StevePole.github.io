(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('BankController', BankController);

    BankController.$inject = ['$rootScope', '$routeParams','BanksService'];

    function BankController($rootScope, $routeParams, BanksService) {
        var vm = this;
        vm.init = init;
        vm.bank = [];

        function init() {
            $rootScope.active = "Banks";
            var bankId = $routeParams.bank;

            console.log($routeParams);

            BanksService.get(bankId)
                .then(function(bank) {
                    vm.bank = bank;
                    return bank;
                });
        }

        init();
    }
})(window.angular);
