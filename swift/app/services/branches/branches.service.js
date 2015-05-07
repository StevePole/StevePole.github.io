(function() {
    'use strict';

    angular
        .module('swift-app.services')
        .service('BankBranchesService', BankBranchesService);

    BankBranchesService.$inject = ['$q', '$http', '$timeout'];

    function BankBranchesService($q, $http, $timeout) {
        var self = this;
        //self.list = list;
        self.getByCode = getByCode;
        self.getByBank = getByBank;

        var basePath = "https://swift-tool.herokuapp.com/";

        /*
        function list() {
            return $http.get(basePath + "branches").then(function(resources) {
                return resources.data;
            });
        }
        */

        function getByCode(code) {
            return $http.get(basePath + "branches?swift=" + code)
                .then(function(resources) {
                    return resources.data;
                });
        }

        function getByBank(bankId) {
            return $http.get(basePath + "banks/"+bankId+"/branches")
                .then(function(resources) {
                    return resources.data;
                });
        }
    }
})();
