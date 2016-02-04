jQuerySDK = {};
jQuerySDK.basePath = 'http://localhost/promises';
jQuerySDK.basePath = 'AlchemyApi/example';

jQuerySDK.$getPath = function(path, params, idKey) {
    var id = params;
    if (typeof params === "object") {
        if (params[idKey]) {
            id = params[idKey];
        } else {
            // TODO some methods don't require an idKey so we shouldn't ask for one
            throw new Error("Path parameter '"+idKey+
                "' not found in parameters for '"+path+"' request.");
        }
    }
    return path.replace(/\{[A-Za-z0-9_]+\}/, id);
};

/**
 * If the API uses a standard envelope we want to find the nested response 
 * before doing any processing on the objects.
 * @param {Object} json
 * @param {Object} headers
 * @param {Boolean} usesEnvelope
 * @returns {Object} json
 */
jQuerySDK.$envelopeHandler = function(json, usesEnvelope) {
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
            // TODO deal with void data type that removes main param key
            throw new Error(
                "Envelope parameter '"+envelopeParam+"' not found in response."
            );
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
 * @returns {Promise} A Promise object for the request
 */
jQuerySDK.$requestPromise = function(url, type, post, 
    responseHandler, errorHandler, responseObject, responseIsArray, responseUsesEnvelope) {
        
    // Strip out $private functions before request
    var postCopy = $.extend({}, post, true);
    $.each(postCopy, function(key, value) {
        if (key.substring(0,1) === "$" && typeof value === 'function') {
           delete postCopy[key];
        }
    });
    
    var promise = new Promise(function(resolve, reject) {
        $.ajax({
            "url": url,
            "type": type,
            "data": postCopy,
            "headers": {},
            "dataType": 'json',
            "success": function(json, textStatus, jqXHR) {
                resolve(json);
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            }
        });
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
                response, responseObject, responseIsArray, responseUsesEnvelope
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
 * @returns {Object}
 */
jQuerySDK.$processResponse = function(response, object, isArray, usesEnvelope) {
    // Remove envelope if appropriate
    response = jQuerySDK.$envelopeHandler(response, usesEnvelope);

    if (isArray) {
        $.each(response, function(idx, iterator) {
            $.extend(iterator, object);
        });
    } else {
        // Turn response into objects, new Albums() is never a deep object
        
        // TODO This causes .get to fire, which is weird...
        $.extend(response, object);
    }
    
    return response;
};

/**
 * The album object, no need to append model properties as it will happen 
 * dynamically, we need this object to supply functions
 * @returns {undefined}
 */
jQuerySDK.Albums = function() {
    // TODO These assume models id property is called 'id'
    this.$create = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Albums.create(this, responseHandler, errorHandler);
    };
    this.$get = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Albums.get(this.id, responseHandler, errorHandler);
    };
    this.$update = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Albums.update(this.id, this, responseHandler, errorHandler);
    };
    this.$delete = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Albums.delete(this.id, responseHandler, errorHandler);
    };
    this.$getSongs = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.getByAlbumId(this.id, responseHandler, errorHandler);
    };
};

// TODO Assumes parameter name is id
jQuerySDK.Albums.create = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums', params),
        'POST', {}, responseHandler, errorHandler, new jQuerySDK.Albums(), false, true
    );
};
jQuerySDK.Albums.get = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums/{id}', params, 'id'),
        'GET', {}, responseHandler, errorHandler, new jQuerySDK.Albums(), false, true
    );
};
jQuerySDK.Albums.update = function(params, post, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums/{id}', params, 'id'),
        'PUT', post, responseHandler, errorHandler, new jQuerySDK.Albums(), false, true
    );
};
jQuerySDK.Albums.delete = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums/{id}', params, 'id'),
        'DELETE', {}, responseHandler, errorHandler, new jQuerySDK.Albums(), false, true
    );
};
jQuerySDK.Albums.getList = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums'),
        'GET', params, responseHandler, errorHandler, new jQuerySDK.Albums(), true, true
    );
};

jQuerySDK.Songs = function() {
    // TODO These assume models id property is called 'id'
    this.$create = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.create(this, responseHandler, errorHandler);
    };
    this.$get = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.get(this.id, responseHandler, errorHandler);
    };
    this.$update = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.update(this.id, this, responseHandler, errorHandler);
    };
    this.$delete = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.delete(this.id, responseHandler, errorHandler);
    };
    this.$getArtist = function(params, responseHandler, errorHandler) {
        return jQuerySDK.Songs.getByAlbumId(this.id, responseHandler, errorHandler);
    };
};

// TODO Assumes parameter name is id    
jQuerySDK.Songs.get = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/songs/{id}', params, 'id'), 
        'GET', {}, responseHandler, errorHandler, new jQuerySDK.Songs(), false, true
    );
};
jQuerySDK.Songs.update = function(params, post, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/songs/{id}', params, 'id'),
        'PUT', post, responseHandler, errorHandler, new jQuerySDK.Songs(), false, true
    );
};
jQuerySDK.Songs.getByAlbumId = function(params, responseHandler, errorHandler) {
    return jQuerySDK.$requestPromise(
        jQuerySDK.$getPath(jQuerySDK.basePath + '/albums/{id}/songs', params, 'id'), 
        'GET', {}, responseHandler, errorHandler, new jQuerySDK.Songs(), true, true
    );
};