(function() {
    'use strict';

    angular
        .module('swift-app.services')
        .service('CountriesService', CountriesService);

    CountriesService.$inject = ['$q', '$http', '$timeout'];

    function CountriesService($q, $http, $timeout) {
        var self = this;
        self.get = get;
        self.list = list;

        var basePath = "https://swift-tool.herokuapp.com/";

        function get(id) {
            return $http.get(basePath + "countries/" + id).then(function(response) {
                return response.data;
            });
            /*
            return self.list().then(function(countries) {
                var country = countries[0];
                angular.forEach(countries, function(countryIter) {
                    if (id === countryIter.id) {
                        country = countryIter;
                    }
                });
                return country;
            });
            */
        }

        function list(search) {
            var url = basePath + "countries";
            if (search) {
                url += "?name=" + search
            }

            return $http.get(url).then(function(response) {
                return response.data;
            });
            /*
            return $http.get("json/countries.json").then(function(countries) {
                if (search) {
                    var filtered = [];
                    angular.forEach(countries.data, function(country) {
                        if (country.name.toLowerCase().substr(0, search.length) === search.toLowerCase()) {
                            filtered.push(country);
                        }
                    });
                    return filtered;
                }
                return countries.data;
            });
            */
        }
    }
})();
