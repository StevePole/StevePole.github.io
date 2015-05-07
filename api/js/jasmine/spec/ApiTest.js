function ApiTester(Swagger, ApiService, Utility, $window) {
    this.window = $window;

    /**
     * Do some preparatory work on the swagger for testing.
     * @param {object} swaggerJson
     * @returns {void}
     */
    this.prepSwaggerForTests = function(swaggerJson) {
        _.each(swaggerJson.models, function(model, modelName) {
            model.id = modelName;
        });
        Utility.log(swaggerJson);
    };

    /**
     * Prepare a request by turning test spec into querystring and header objects
     * and building the post model
     * @param {object} test The test spec
     * @param {object} swaggerJson The json spec for the API
     * @param {string|integer} previousId
     * @param {string} accessToken
     * @returns {object} request information
     */
    this.prepareRequest = function(test, swaggerJson, previousId, accessToken) {
        
        var request = {
            url: false,
            method: test.method,
            query: [],
            headers: {},
            body: false,
            previousId: previousId
        };

        if (Swagger.methodSupportsPostData(test.method)) {
            request.body = Swagger.convertExpectationsToObject(test.postData);
        }

        if (test.idTarget) {
            // The property we're subbing into won't be in the params array, add it
            // TODO if that's not true and it is parmaType=query this will duplicate it
            var paramSpec = Swagger.findParameterByName(test.operation, test.idTarget);
            test.parameters.push({
                name: test.idTarget,
                value: previousId,
                paramType: paramSpec.paramType
            });
        }

        /*
        test.parameters.push({
                name: "access_token",
                value: accessToken,
                paramType: "query"
        });
        */

        // Add the param specs so we can check them
        _.each(test.parameters, function(parameter) {
            parameter.spec = Swagger.findParameterByName(
                test.operation,
                parameter.name
            );

            if (test.idTarget === parameter.name) {
                parameter.value =  previousId;
            }

            // Substitute path params into path
            switch(parameter.spec.paramType) {
                case "path":
                    test.path = test.path.replace("{"+parameter.name+"}", parameter.value);
                    test.path = test.path.replace("%7B"+parameter.name+"%7D", parameter.value);
                    break;
                case "query":
                    request.query.push(parameter.name + "=" + encodeURIComponent(parameter.value));
                    break;
                case "header":
                    request.headers[parameter.name] = parameter.value;
                    break;
            }
        });

        // Must wait until test.path has {values} substituted in
        request.url = (swaggerJson.testPath ? swaggerJson.testPath : swaggerJson.basePath) + test.path;

        // TODO push into parameter list instead as might be a header based access token
        request.query.push("access_token=" + accessToken);

        return request;
    };

    /**
     * Make an API request synchronously
     * @param {string} method The http method
     * @param {string} requestUrl The request URL
     * @param {array} query An array of querystring pairs "a=b"
     * @param {object} headers A map of header names and values {name:value}
     * @param {object} body The post data for the body of the request
     * @returns {this.makeRequest.response} Response information
     */
    this.makeRequest = function(method, requestUrl, query, headers, body) {
        var response = {
            body: false,
            isError: false,
            httpCode: false,
            id: false
        };

        if (!_.isEmpty(query)) {
            if (requestUrl.indexOf("?") < 0) {
                requestUrl += "?";
            }
            requestUrl += query.join("&");
        }

        var settings = {
            type: method,
            dataType: "json",
            url: "/AlchemyApi/proxy.php?__url=" + encodeURIComponent(requestUrl),
            async: false,
            success: function(json, textStatus, jqXHR) {
                // TODO Massive hack to get around double envelope in Alchemy API
                if ((requestUrl.indexOf("manage.alchemysocial.com") ||
                    requestUrl.indexOf("staging.alchemysocial.com")) && json.response) {
                    response.body = json.response;
                } else {
                    response.body = json;
                }
                Utility.log(json);
                response.httpCode = jqXHR.status;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // See if we can parse the response text into JSON
                try {
                    response.body = JSON.parse(textStatus);
                } catch(ex) {
                    response.isError = true;
                    throw new Error(
                        "Couldn't parse response as JSON, for '" + method +
                        " " + requestUrl + "', HTTP code " + jqXHR.status
                    );
                }
                response.httpCode = jqXHR.status;
            }
        };

        if (body) {
            settings.data = body;
        }
        if (!_.isEmpty(headers)) {
            settings.headers = headers;
        }

        // Make the API call through our proxy
        $.ajax(settings);

        return response;
    };

    /**
     * Test a request, check it's parameters and post model against declared spec
     * @param {object} test
     * @param {object} models
     * @param {object} requestUrl
     * @param {object} postModel
     * @param {string|integer} previousId
     * @param {integer|boolean} iterationLimit Number of array entries to check, default all.
     * @returns {void}
     */
    this.testRequest = function(test, models, requestUrl, postModel, previousId, iterationLimit) {
        describe("in " + test.method + " " + test.path + " request,", function() {
            if (test.idTarget) {
                describe("previous id", function() {
                    it("should be set.", function() {
                        expect(previousId).toBeTruthy();
                    });
                    it("should be a simple type.", function() {
                        expect(previousId).toBeSimpleType();
                    });
                });
            }

            // Test path/query params
            _.each(test.parameters, function(parameter) {
                describe("supplied parameter '" + parameter.name + "':", function() {
                    it("should be documented.", function() {
                        expect(parameter.spec).toBeTruthy();
                    });
                    it("should have a paramType.", function() {
                        expect(parameter.paramType).toBeTruthy();
                    });
                    it("should have a value.", function() {
                        expect(parameter.value).toBeTruthy();
                    });
                    it("paramType '" + parameter.paramType + "' shoud match that in the spec.", function() {
                        expect(parameter.paramType).toEqual(parameter.spec.paramType);
                    });

                    Types.checkType(
                        "",
                        parameter.value,
                        parameter.spec,
                        models,
                        iterationLimit,
                        1
                    );
                });
            });

            it("URL should have all path parameters replaced.", function() {
                expect(requestUrl).toNotContainReplaceables();
            });

            // Test params in the post data model
            if (postModel) {
                this.testPostModel(
                    test.operation,
                    models,
                    postModel,
                    iterationLimit
                );
            }
        });
    };

    /**
     * Test a post data model 
     * @param {object} operation The swagger operation the post data relates to
     * @param {object} models The collection of swagger models
     * @param {object} postModel
     * @param {integer} iterationLimit  How many time to iterate when examining arrays
     * @returns {void}
     */
    this.testPostModel = function(operation, models, postModel, iterationLimit) {
        if (!iterationLimit) {
            iterationLimit = false;
        }

        // It would be possible to do this without iterating by relying 
        // on spec.postDataModel, but that is not native to Swagger.
        _.each(postModel, function(propertyValue, propertyName) {
            var propertySpec = Swagger.findParameterByName(operation, propertyName);

            it("should be documented.", function() {
                expect(propertySpec).toBeTruthy();
            });
            it("should have paramType 'body'.", function() {
                expect(propertySpec.paramType).toEqual("body");
            });

            Types.checkType(
                "supplied post data parameter '" + propertyName + "'", 
                propertyValue, 
                propertySpec, 
                models,
                iterationLimit,
                1
            );
        });
    };

    /**
     * Run a test suite
     * @param {object} testSuite
     * @param {object} swaggerJson
     * @param {string} accessToken
     * @returns {void}
     */
    this.runTestSuite = function(testSuite, swaggerJson, accessToken) {
        var apiTester = this;
        Utility.log(testSuite);
        
        describe("For '" + testSuite.name + "' test suite,", function() {
            beforeEach(function() {
                jasmine.addMatchers(Types.customMatchers);
            });

            var previousId = false;

            _.each(testSuite.tests, function(test) {
                previousId = apiTester.runTest(
                    testSuite,
                    test,
                    swaggerJson,
                    accessToken,
                    previousId
                );
            });
        });
    };

    /**
     * Run a single test
     * @param {object} testSuite
     * @param {object} test
     * @param {object} swaggerJson
     * @param {string} accessToken
     * @param {string|integer|boolean} previousId
     * @returns {string|integer|boolean} responseId
     */
    this.runTest = function(testSuite, test, swaggerJson, accessToken, previousId) {
        if (test.skip) {
            return;
        }

        this.prepareTest(test, swaggerJson, accessToken);

        var request = this.prepareRequest(test, swaggerJson, previousId, accessToken);

        this.testRequest(
            test,
            swaggerJson.models,
            request.url,
            request.body,
            request.previousId,
            testSuite.iterationLimit
        );

        var response = this.makeRequest(
            request.method,
            request.url,
            request.query,
            request.headers,
            request.body
        );

        // Extract the id in case we need it for next request
        response.id = Swagger.findIdInResponse(
            swaggerJson.models,
            test.model,
            response.body
        );

        this.testResponse(
            test, 
            swaggerJson.models, 
            response.body, 
            response.httpCode, 
            response.isError,
            response.id,
            testSuite.iterationLimit
        );

        return response.id;
    };

    /**
     * Tests an API response conforms to the declared spec
     * @param {object} test
     * @param {object} models
     * @param {object|string|integer|boolean} response
     * @param {integer} httpCode
     * @param {boolean} isError
     * @param {integer|string|boolean} responseId
     * @param {integer} iterationLimit The number of array entries to check
     * @returns {void}
     */
    this.testResponse = function(test, models, response, httpCode, isError, responseId, iterationLimit) {
        if (!response) {
            throw new Error("Response should be set!");
        }

        // Interrogate response
        describe("in " + test.method + " " + test.path + "", function() {
            it ("returned the expected http code", function() {
                expect(httpCode).toEqual(test.responseCode);
            });

            if (!isError) {
                // TODO determine which model to check against based on HTTP code
                Types.checkType(
                    "response", 
                    response, 
                    test,
                    models, 
                    iterationLimit,
                    1
                );

                // Check expectations
                if (test.expectations) {
                    Types.checkExpectations("response expected", test.expectations, response);
                }
            }

            describe("response id", function() {
                it("should be set.", function() {
                    expect(responseId).toBeTruthy();
                });
                it("should be a simple type.", function() {
                    expect(responseId).toBeSimpleType();
                });
            });
        });
    };

    /**
     * Prepare a test script by appending relevant information
     * @param {object} test
     * @param {object} swaggerJson
     * @param {string} accessToken
     * @returns {void}
     */
    this.prepareTest = function(test, swaggerJson, accessToken) {
        // Add the operation spec to the test so we can check it
        test.operation = Swagger.findOperationByPathAndMethod(
            swaggerJson.apis,
            test.path,
            test.method
        );

        if (!test.operation) {
            throw new Error("Operation spec not found: " + test.path);
        }

        if (test.operation.requiresAuth && !accessToken) {
            throw new Error("Operation requires authentication but we did not receive an access token.");
        }

        // TODO remove this.
        // Just in case ref not set when it should be
        if (!_.contains(Swagger.types, test.operation.type)) {
            test.operation.$ref = test.operation.type;
        }

        // TODO simple types
        test.$ref = false;
        if (test.operation.items && test.operation.items.$ref) {
            test.$ref = test.operation.items.$ref;
        } else if (test.operation.$ref) {
            test.$ref = test.operation.$ref;
        } else {
            test.simple = true;
        }

        if (!test.$ref) {
            Utility.log(test);
            throw new Error("Simple types not supported!");
        }
        test.model = Swagger.getModelByName(swaggerJson.models, test.$ref);
    };

    
    /**
     * Synchronously load a remote file, assign response to the supplied swagger 
     * parameter by reference. TODO switch to closure 
     * @param {string} swaggerPath name of the file
     * @returns {void}
     */
    this.loadRemoteFile = function(swaggerPath) {
        var apiTester = this;
        var swaggerJson;
        
        try {
            // Make synchronus request.
            $.ajax({
                dataType: "json",
                url: "/AlchemyApi/" + swaggerPath,
                async: false,
                success: function(response) {
                    swaggerJson = response;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //throw errorThrown;
                }
            });
        } catch(ex) {
            throw ex;
        }
        
        return swaggerJson;
    };
    
    /**
     * Synchronously load local file, promise approach from ApiService doesn't 
     * work
     * @param {string} swaggerPath
     * @returns {Object}
     */
    this.loadLocalFile = function(swaggerPath) {
        var ls = this.window.localStorage;
        return JSON.parse(ls.getItem(swaggerPath));
    };

    /**
     * Load swagger file from remote file or local storage
     * @returns {Array|Object}
     */
    this.loadSwagger = function() {
        var swaggerJson;
        var swaggerPath = Utility.getURLParameter("json");
        if (swaggerPath) {
            // Load Swagger spec
            swaggerJson = this.loadRemoteFile(swaggerPath);
        } else {
            swaggerPath = Utility.getURLParameter("ls");
            swaggerJson = this.loadLocalFile(swaggerPath);
        }
        if (!swaggerJson) {
            throw new Error("Swagger not found");
        }
        
        this.prepSwaggerForTests(swaggerJson);
        
        return swaggerJson;
    };

    /**
     * Get access token, load swagger spec, find test suite, and execute tests
     * @returns {void}
     */
    this.loadAndRunTestSuite = function() {
        
        Utility.log("loadAndRunTestSuite");
        
        // Get an access token from the querystring or from a prompt
        var accessToken = Utility.getURLParameter("access_token"), testSuite = false;
        if (!accessToken) {
            accessToken = prompt("Please supply an access token:");
            window.location = window.location + "&access_token=" + accessToken;
        }

        var testSuiteIndex = Utility.getURLParameter("testSuite");
        if (!testSuiteIndex) {
            testSuiteIndex = 0;
        }

        var swaggerJson = this.loadSwagger();

        if (swaggerJson.testSuites && swaggerJson.testSuites[testSuiteIndex]) {
            testSuite = swaggerJson.testSuites[testSuiteIndex];
        } else {
            throw new Error("Test suite "+testSuiteIndex+" not found.");
        }

        this.runTestSuite(testSuite, swaggerJson, accessToken);
    };
}

var apiTester = new ApiTester(
    new Swagger(),
    new ApiService(),
    new Utility(),
    window
);
apiTester.loadAndRunTestSuite();



