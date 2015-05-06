(function() {
    'use strict';

    angular
        .module('swift-app.mocks')
        .service('BanksServiceMock', BanksServiceMock);

    BanksServiceMock.$inject = ['$q'];

    function BanksServiceMock($q) {
        var self = this;
        self.get = get;
        self.list = list;
        self.getByCode = getByCode;
        self.getByCountry = getByCountry;

        var data = [{
            id: 1,
            name: "Mock!"
        },{
            id: 2,
            name: "Another mock?"
        }];

        function get(id) {
            var deferred = $q.defer();
            deferred.resolve(data[0]);
            return deferred.promise;
        }
        function list() {
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }

        function getByCode() {
            return list();
        }

        function getByCountry() {
            return list();
        }
    }
})();
