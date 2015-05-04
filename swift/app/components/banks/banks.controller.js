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
        vm.banks = [];

        vm.query = "";


        function init() {
            $rootScope.active = "Banks";
        }

        function search() {
            BanksService.getByCode(vm.query)
                .then(function(banks) {
                    vm.banks = banks;
                    return banks;
                });
        }

        init();
    }
})(window.angular);
