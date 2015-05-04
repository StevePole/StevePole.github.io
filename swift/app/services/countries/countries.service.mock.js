(function() {
    'use strict';
    
    angular
        .module('swift-app.mocks')
        .service('CountriesServiceMock', CountriesServiceMock);

    CountriesServiceMock.$inject = ['$q'];

    function CountriesServiceMock($q) {
        var self = this;
        self.get = get;
        self.list = list;
        self.save = save;
        
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
        function save(resource) {
            var deferred = $q.defer();
            deferred.resolve(resource);
            return deferred.promise;
        }
    }
})();