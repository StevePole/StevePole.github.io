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
        self.getByName = getByName;
        self.getByCode = getByCode;
        self.getByCountry = getByCountry;

        var basePath = "https://swift-tool.herokuapp.com/";

        function get(id) {
            return $http.get(basePath +"banks/"+id).then(function(resources) {
                return resources.data;
            });

            /*
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
            */
        }

        function list() {
            return $http.get(basePath + "banks").then(function(resources) {
                return resources.data;
            });

            //return $http.get("json/banks.json").then(function(resources) {
            //    return resources.data;
            //});
        }

        function getByName(name) {
            return $http.get(basePath + "banks?name=" + name).then(function(resources) {
                return resources.data;
            });
        }

        function getByCode(code) {
            return $http.get(basePath + "banks?swift=" + code).then(function(resources) {
                return resources.data;
            });

            //return $http.get("json/banks.json").then(function(resources) {
            //    return resources.data;
            //});
        }

        function getByCountry(country) {
            return $http.get(basePath + "countries/"+country+"/banks").then(function(resources) {
                return resources.data;
            });

            //return $http.get("json/banks.json").then(function(resources) {
            //    return resources.data;
            //});
        }
    }
})();
