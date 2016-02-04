/**
 * DO NOT EDIT THIS FILE, this file was automatically generated, any edits 
 * will be overwritten when the file is regenerated.
 * 
 * This is an SDK containing AngularJS factories for accessing the restful web 
 * service at /AlchemyApi/example - The SDK was generated for 
 * version 1 of the API.
 * 
 * To use the services within your AngularJS application, import into your 
 * application and controllers as follows:
 * 
 *   angular.module('YourApp', ['sdkService'])
 *   .controller('YourController', ['$scope', 'Albums',
 *       function($scope, Albums) {
 *           $scope.albums = Albums.get({id: 1 });
 *       }
 *   ]);
 *
 * To create an object use the following pattern. Note, when calling functions 
 * directly on resource instances the functions are prefixed with '$', so 
 * 'create' becomes '$create':
 * 
 *  var albums = new Albums();
 *  albums.example = "example";
 *  albums.$create(function(response) { }, function(error) { });
 *  
 * The object returned from a get() is a resource itself, so you can update it 
 * directly and issue an update. By nesting the second request in the response
 * handler we have full access to the object returned from the first call.
 *  
 *  Albums.get({id: 1}, function(albums) {
 *      albums.example = "example";
 *      albums.$update(function(response) { }, function(error) { });
 *  });
 * 
 * Angular even returns resources for array responses so you can do the 
 * following:
 * 
 *  Albums.getList({}, function(albums) {
 *      var object = albums[0];
 *      object.example = "example";
 *      object.$update(function(response) { }, function(error) { });
 *  });
 *  
 * If for some reason the object you are dealing with is not a resource, you can
 * use an alternative formulation to issue an update:
 * 
 *  Albums.update(
 *      {id: object.id}, object, function(response) { }, function(error) { }
 *  );
 */
var sdkService = angular.module('sdkService', ['ngResource']);

/**
 * @name sdkService.envelopeHandler
 * Handler for methods returning a response envelope, if an error is detected
 * it will be thrown, otherwise the nested response will be returned.
 * 
 * If you prefer to access the full response, override this function.
 * 
 * @param {string} data The raw response data
 * @param {object} header An object containing any response headers
 * @returns {object} Either an Error object or the response
 */
sdkService.envelopeHandler = function(json, headers) {
    if (json) {
        if (json.error) {
            throw new Error(json.error.message);
        }
        return json.data;
    }
    return {};
};

/**
 * Factory for interacting with Albums objects and their
 * related descendents.
 */
sdkService.factory('Albums', ['$resource', function($resource) {
    return jQuerySDK.Albums;
}]);

/**
 * Factory for interacting with Songs objects and their
 * related descendents.
 */
sdkService.factory('Songs', ['$resource', function($resource) {
    return jQuerySDK.Songs;
}]);

/**
 * Factory for interacting with Artists objects and their
 * related descendents.
 */
sdkService.factory('Artists', ['$resource', function($resource) {
    return jQuerySDK.Artists;
}]);


var jQuerySDK = {};

/**
 * If the API uses a standard envelope we want to find the nested response 
 * before doing any processing on the objects.
 * @param {Object} json
 * @param {Boolean} usesEnvelope
 * @param {Boolean} isVoid Are we expecting a void response
 * @returns {Object} json
 */
jQuerySDK.$envelopeHandler = function(json, usesEnvelope, isVoid) {
    var envelopeParam = 'data';
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
        if (usesEnvelope) {
            if (json[envelopeParam]) {
                return json[envelopeParam];
            }
            // Void data type removes main param key
            if (!isVoid) {
                throw new Error(
                    "Envelope parameter '"+envelopeParam+"' not found in response."
                );
            }
        }
        return json;
    }
    return {};
};


/**
 * Get an appropriate promise object for the request, also adds the users 
 * response callback and transforms the response to be objects with additional
 * methods.  Further response handler can be chained on the promise using .then
 * 
 * @param {String} url The url endpoint to request
 * @param {String} type The request type e.g. GET/POST/PUT/DELETE
 * @param {Object} post The post data
 * @param {Function} responseHandler A success response handler for the promise
 * @param {Function} errorHandler An error response handler for the promise
 * @param {Object} responseObject Object ontaining functions to be mapped to response objects
 * @param {Boolean} responseIsArray Indicate if the main repsonse is an array
 * @param {Boolean} responseUsesEnvelope Indicate if the endpoint uses the response envelope
 * @param {Boolean} responseIsVoid Are we expecting a void response
 * @returns {Promise} A Promise object for the request
 */
jQuerySDK.$requestPromise = function(responseJson, type, post, 
    responseHandler, errorHandler, 
    responseObject, responseIsArray, responseUsesEnvelope, responseIsVoid) {
        
    // Strip out $private functions before request
    var postCopy = $.extend({}, post, true);
    $.each(postCopy, function(key, value) {
        if (key.substring(0,1) === "$" && typeof value === 'function') {
           delete postCopy[key];
        }
    });
    
    var promise = new Promise(function(resolve, reject) {
        resolve(responseJson); 
    });
    
    // Nest response handler because we want to process results
    return promise.then(function(response) {
        
        // TODO If JSONP error should be in response not header, interrogate 
        // response and fire custom error
        
        if (responseHandler) {
            // Pass output to client's response handler
            return responseHandler(response);
        } else {
            return jQuerySDK.$processResponse(
                response, responseObject, 
                responseIsArray, responseUsesEnvelope, responseIsVoid
            );
        }
    });//, errorHandler);
};

/**
 * Process the response we recieve from the API
 * 
 * @param {Object} response The JSON response.
 * @param {Object} object A new empty object containing the methods that should
 * be available on the returned objects, these will be cloned into the response
 * @param {Boolean} isArray Are we expecting array response?
 * @param {Boolean} usesEnvelope Does the enpoint return a response envelope
 * @param {Boolean} isVoid Are we expecting a void response
 * @returns {Object}
 */
jQuerySDK.$processResponse = function(response, object, isArray, usesEnvelope, isVoid) {
    // Remove envelope if appropriate
    response = jQuerySDK.$envelopeHandler(response, usesEnvelope, isVoid);

    if (isArray) {
        $.each(response, function(idx, iterator) {
            $.extend(iterator, object);
        });
    } else {
        // Turn response into objects, new object is never a deep object
        
        // TODO This causes .get to fire, which is weird...
        $.extend(response, object);
    }
    
    return response;
};


    
jQuerySDK.Albums = function() {
    this.$get = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Albums.get(params, responseHandler, errorHandler);
    };
    this.$update = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Albums.update(params, this, responseHandler, errorHandler);
    };
    this.$getSongs = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Songs.getByAlbumsId(params, responseHandler, errorHandler);
    };
};
    
jQuerySDK.Albums.get = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "OK Computer",
        "artist": {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        "released": 1997,
        "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
        "artistId": 12345,
        "genre": "rock"
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Albums(), false, true, false
    );
};
jQuerySDK.Albums.update = function(params, post, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "OK Computer",
        "artist": {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        "released": 1997,
        "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
        "artistId": 12345,
        "genre": "rock"
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'PUT', post, responseHandler, errorHandler, 
        new jQuerySDK.Albums(), false, true, false
    );
};
jQuerySDK.Albums.getList = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Albums(), true, true, false
    );
};
jQuerySDK.Albums.getBySongsId = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Albums(), true, true, false
    );
};
jQuerySDK.Albums.getByArtistsId = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        },
        {
            "id": 123456789,
            "name": "OK Computer",
            "artist": {
                "id": 123456789,
                "name": "Radiohead",
                "yearsActive": [
                    1997
                ]
            },
            "released": 1997,
            "coverImg": "https://upload.wikimedia.org/wikipedia/en/a/a1/Radiohead.okcomputer.albumart.jpg",
            "artistId": 12345,
            "genre": "rock"
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Albums(), true, true, false
    );
};

    
jQuerySDK.Songs = function() {
    this.$create = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        return jQuerySDK.Songs.create(params, this, responseHandler, errorHandler);
    };
    this.$get = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Songs.get(params, responseHandler, errorHandler);
    };
    this.$update = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Songs.update(params, this, responseHandler, errorHandler);
    };
    this.$delete = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Songs.delete(params, responseHandler, errorHandler);
    };
    this.$getAlbums = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Albums.getBySongsId(params, responseHandler, errorHandler);
    };
};
    
jQuerySDK.Songs.create = function(params, post, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "Paranoid Android",
        "secondsDuration": 245
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'POST', post, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), false, true, false
    );
};
jQuerySDK.Songs.get = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "Paranoid Android",
        "secondsDuration": 245
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), false, true, false
    );
};
jQuerySDK.Songs.update = function(params, post, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "Paranoid Android",
        "secondsDuration": 245
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'PUT', post, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), false, true, false
    );
};
jQuerySDK.Songs.delete = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "Paranoid Android",
        "secondsDuration": 245
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'DELETE', {}, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), false, true, false
    );
};
jQuerySDK.Songs.getList = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), true, true, false
    );
};
jQuerySDK.Songs.getByAlbumsId = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        },
        {
            "id": 123456789,
            "name": "Paranoid Android",
            "secondsDuration": 245
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Songs(), true, true, false
    );
};

    
jQuerySDK.Artists = function() {
    this.$get = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Artists.get(params, responseHandler, errorHandler);
    };
    this.$getAlbums = function(params, responseHandler, errorHandler) {
        params = params ? params : {};
        params.id = this.id;
        return jQuerySDK.Albums.getByArtistsId(params, responseHandler, errorHandler);
    };
};
    
jQuerySDK.Artists.get = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": {
        "id": 123456789,
        "name": "Radiohead",
        "yearsActive": [
            1997
        ]
    },
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Artists(), false, true, false
    );
};
jQuerySDK.Artists.getList = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
{
    "data": [
        {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        },
        {
            "id": 123456789,
            "name": "Radiohead",
            "yearsActive": [
                1997
            ]
        }
    ],
    "paging": {
        "next": "https://api.example.com/resource?offset=20&limit=20",
        "prev": "https://api.example.com/resource?offset=0&limit=20",
        "first": "https://api.example.com/resource?offset=0&limit=20",
        "last": "https://api.example.com/resource?offset=180&limit=20",
        "total": 200
    }
},
        'GET', {}, responseHandler, errorHandler, 
        new jQuerySDK.Artists(), true, true, false
    );
};

