(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('BankController', BankController);

    BankController.$inject = [
        '$rootScope',
        '$routeParams',
        'BanksService',
        'BankBranchesService'
    ];

    function BankController(
        $rootScope,
        $routeParams,
        BanksService,
        BankBranchesService)
    {
        var vm = this;
        vm.init = init;
        vm.bank = {};
        vm.branches = [];

        function init() {
            $rootScope.active = "Banks";
            var bankId = $routeParams.bank;

            BanksService.get(bankId)
                .then(function(bank) {
                    vm.bank = bank;
                    return bank;
                });

            BankBranchesService.getByBank(bankId)
                .then(function(branches) {
                    vm.branches = branches;
                    return branches;
                });
        }

        init();
    }
})(window.angular);
