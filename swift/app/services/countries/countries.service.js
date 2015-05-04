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

        function get(id) {
            return self.list().then(function(countries) {
                var country = countries[0];
                angular.forEach(countries, function(countryIter) {
                    if (id === countryIter.id) {
                        country = countryIter;
                    }
                });
                return country;
            });
        }

        function list(search) {
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
        }
    }
})();
