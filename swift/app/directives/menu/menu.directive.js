(function() {

    angular
        .module('swift-app.directives')
        .directive('menu', menu);

    function menu() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: "=ngModel"
            },
            controller: [
                '$rootScope',
                menuController
            ],
            controllerAs: "vm",
            bindToController: true,
            templateUrl: "templates/menu.html"
        };
    }

    function menuController($rootScope) {
        var vm = this;
        vm.test = "Directive";

        //vm.active = $rootScope.active;
    }
})();
