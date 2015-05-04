(function() {

    angular
        .module('swift-app.directives')
        .directive('bankAddress', bankAddress);

    function bankAddress() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                address: "="
            },
            controller: [
                '$scope',
                bankAddressController
            ],
            controllerAs: "vm",
            bindToController: true,
            templateUrl: "templates/bank-address.html"
        };
    }

    function bankAddressController($scope) {
        var vm = this;
        vm.test = "Directive";
    }
})();
