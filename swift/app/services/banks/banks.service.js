(function() {
    'use strict';

    angular
        .module('swift-app.services')
        .service('BanksService', BanksService);

    BanksService.$inject = ['$q', '$http', '$timeout'];

    function BanksService($q, $http, $timeout) {
        var self = this;
        self.get = get;
        self.list = list;
        self.getByCode = getByCode;
        self.getByCountry = getByCountry;

        function get(id) {
            console.log(id);
            return self.list().then(function(resources) {
                var resource = resources[0];
                angular.forEach(resources, function(resourceIter) {
                    if (id === resourceIter.id) {
                        resource = resourceIter;
                    }
                });
                return resource;
            });
        }

        function list() {
            return $http.get("json/banks.json").then(function(resources) {
                return resources.data;
            });
        }

        function getByCode(code) {
            return $http.get("json/banks.json").then(function(resources) {
                return resources.data;
            });
        }

        function getByCountry(country) {
            return $http.get("json/banks.json").then(function(resources) {
                return resources.data;
            });
        }
    }
})();
