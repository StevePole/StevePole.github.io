(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('BanksController', BanksController);

    BanksController.$inject = ['$rootScope', 'BanksService'];

    function BanksController($rootScope, BanksService) {
        var vm = this;
        vm.init = init;
        vm.search = search;
        vm.clear = clear;
        vm.banks = [];

        vm.status = 0;  // 0 = Not checked, 1 = Valid, 2 = Invalid
        vm.query = "";

        function init() {
            $rootScope.active = "Banks";
        }

        function search() {
            BanksService.getByCode(vm.query)
                .then(function(banks) {
                    if (banks.length) {
                        vm.banks = banks;
                        vm.status = 1;
                    } else {
                        vm.status = 2;
                    }
                    return banks;
                });
        }

        function clear() {
            vm.status = 0;
            vm.banks = [];
        }

        init();
    }
})(window.angular);
