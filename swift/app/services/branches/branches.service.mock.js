(function(angular) {
    'use strict';

    angular
        .module('swift-app.mocks')
        .service('BankBranchesServiceMock', BankBranchesServiceMock);

    BankBranchesServiceMock.$inject = ['$q'];

    function BankBranchesServiceMock($q) {
        var self = this;
        self.getByBank = getByBank;
        self.getByCode = getByCode;

        var data = [{
            id: 1,
            name: "Mock!",
            address1: "",
            address2: "",
            city: "",
            bankId: ""
        },{
            id: 2,
            name: "Another mock?",
            address1: "",
            address2: "",
            city: "",
            bankId: ""
        }];

        function list() {
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }

        function getByBank() {
            return list();
        }

        function getByCode() {
            return list();
        }
    }
})(window.angular);
