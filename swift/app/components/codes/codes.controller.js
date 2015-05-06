(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('CodesController', CodesController);

    CodesController.$inject = ['$rootScope', 'BanksService'];

    function CodesController($rootScope, BanksService) {
        var vm = this;
        vm.init = init;
        vm.search = search;
        vm.clear = clear;
        vm.banks = [];

        vm.status = 0;  // 0 = Not checked, 1 = Valid, 2 = Invalid
        vm.code = "";

        function init() {
            $rootScope.active = "Codes";

        }

        function search() {
            BanksService.getByCode(vm.code)
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
