
var sdkService = angular.module('sdkService', ['ngResource']);

sdkService.envelopeHandler = function(json, headers) {
    //var json = JSON.parse(data);
    if (json) {
        if (json.error) {
            return new Error(json.error.message);
            /*throw { 
                name:        "", 
                level:       json.error.code, 
                message:     json.error.message, 
                htmlMessage: json.error.message,
                toString:    function() { return this.message; } 
            };*/
        }
        return json.data;
    }
    return {};
};

sdkService.factory('Albums', ['$resource',
    function($resource) {
        return $resource(':_parent/:id/:_child', {_parent: 'albums'}, {
            get: {
                method: 'GET',
                responseType: 'json',
                params: {id: '@id'},
                transformResponse: sdkService.envelopeHandler
            },
            getList: {
                method: 'GET',
                responseType: 'json',
                isArray: true,
                transformResponse: sdkService.envelopeHandler
            }
        });
    }
]);
sdkService.factory('Songs', ['$resource',
    function($resource) {
        return $resource(':_parent/:id/:_child', {_parent: 'songs'}, {
            create: {
                method: 'POST',
                responseType: 'text',
                transformResponse: sdkService.envelopeHandler
            },
            update: {
                method: 'PUT',
                responseType: 'json',
                params: {id: '@id'},
                transformResponse: sdkService.envelopeHandler
            },
            delete: {
                method: 'DELETE',
                responseType: 'json',
                params: {id: '@id'},
                transformResponse: sdkService.envelopeHandler
            },
            getByAlbumsId: {
                method: 'GET',
                responseType: 'json',
                params: {id: 'REQUIRED', _parent: 'albums', _child: 'songs'},
                isArray: true,
                transformResponse: sdkService.envelopeHandler
            }
        });
    }
]);