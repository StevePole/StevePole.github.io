(function(angular) {
    'use strict';

    angular
        .module('swift-app.controllers')
        .controller('CodesController', CodesController);

    CodesController.$inject = ['$rootScope', 'BankBranchesService'];

    function CodesController($rootScope, BankBranchesService) {
        var vm = this;
        vm.init = init;
        vm.search = search;
        vm.clear = clear;
        vm.branches = [];

        vm.status = 0;  // 0 = Not checked, 1 = Valid, 2 = Invalid
        vm.code = "";

        function init() {
            $rootScope.active = "Codes";
        }

        function search() {
            BankBranchesService.getByCode(vm.code)
                .then(function(branches) {
                    if (branches.length) {
                        vm.branches = branches;
                        vm.status = 1;
                    } else {
                        vm.status = 2;
                    }
                    return branches;
                });
        }

        function clear() {
            vm.status = 0;
            vm.branches = [];
        }

        init();
    }
})(window.angular);
