function Types() {
    /*this.checkType = function() {
        alert("wtf?");
    };*/
}


/**
 * Types.checkObject
 * Check all the properties of an object are specified, and that they conform to
 * the type definition.
 * @param {string} key The name of the property we're examining, useful for feedback
 * @param {object} value The value we're examining
 * @param {string} typeObject An object that specifies the type we're examining
 * @param {object} models The collection of models
 * @param {integer} iterationLimit Optionally limit iterations in array and dictionaries
 * @param {integer} depth The recursion depth;
 * @returns {void}
 */
Types.checkType = function(key, value, typeObject, models, iterationLimit, depth) {
	if (depth > 10) {
		throw new Error("Too much recursion");
	}

	if (!typeObject) {
		throw new Error("typeObject is undefined");
	}

    if (typeObject.enum && !typeObject.items) {
        Types.checkEnum(key, value, typeObject.enum, false);
    } else if (typeObject.type === "string") {
		Types.checkString(key, value, false);
	} else if (typeObject.type === "integer") {
		Types.checkInt32(key, value, false);
	} else if (typeObject.type === "number") {
		Types.checkDouble(key, value, false);
	} else if (typeObject.type === "byte") {
		Types.checkByte(key, value, false);
	} else if (typeObject.type === "boolean") {
		Types.checkBoolean(key, value, false);
	} else if (typeObject.type === "void") {
		expect(value).not().isDefined(); // TODO ?
	} else if (typeObject.$ref) {
		Types.checkObject(key, value, typeObject.$ref, models, iterationLimit, depth + 1);
	} else if (typeObject.items) {
        if (typeObject.isDictionary) {
            Types.checkDictionary(key, value, models, typeObject, iterationLimit, depth + 1);
        } else {
            Types.checkArray(key, value, models, typeObject, iterationLimit, depth + 1);
        }
	} else {
		throw new Error("Unrecognised Type!");
	}
};
Types.checkExpected = function(value, expected) {
	if (expected) {
		it("should be '" + expected + "'", function() {
			expect(value).toBe(expected);
		});
	}
};
Types.checkString = function(key, value, expected) {
	describe(key, function() {
		it("should be a string", function() {
			if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeString();
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkDate = function(key, value, expected) {
    describe(key, function() {
		it("should be a date", function() {
			if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeDate();
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkDateTime = function(key, value, expected) {
    describe(key, function() {
		it("should be a date-time", function() {
			if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeDateTime();
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkInt32 = function(key, value, expected) {
	describe(key, function() {
		it("should be an integer(int32): " + value, function() {
            if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeNumber();
                expect(value).toBeInteger();
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkInt64 = function(key, value, expected) {
    describe(key, function() {
		it("should be a integer(int64): " + value, function() {
            if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeNumber();
                expect(value).toBeInteger();
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkDouble = function(key, value, expected) {
	describe(key, function() {
		it("should be a double: " + value, function() {
			if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeNumber(); // TODO better test
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkFloat = function(key, value, expected) {
    describe(key, function() {
		it("should be a float: " + value, function() {
			if (!_.isNull(value)) { // TODO make this swithcable
                expect(value).toBeNumber(); // TODO better test
            }
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkBoolean = function(key, value, expected) {
    describe(key, function() {
		it("should be a boolean", function() {
			expect(value).toBeBoolean();
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkByte = function(key, value, expected) {
    describe(key, function() {
		it("should be a byte", function() {
			expect(value).toBeByte();
		});
		Types.checkExpected(value, expected);
	});
};
Types.checkEnum = function(key, value, enums, expected) {
    describe(key, function() {
		it("should be a valid enum", function() {
            // TODO bit of a hack, should accomodate int enums
			expect(""+value).toBeString();
            expect(enums).toContain(""+value);
		});
		Types.checkExpected(value, expected);
	});
};

/**
 * Types.checkObject
 * Check all the properties of an object are specified, and that they conform to
 * the type definition.
 * @param {string} key The name of the property we're examining, useful for feedback
 * @param {object} value The value we're examining
 * @param {string} modelName The name of the model representing what we're examining
 * @param {object} models The collection of models
 * @param {integer} iterationLimit Optionally limit iterations in array and dictionaries
 * @param {integer} depth The recursion depth;
 * @returns {void}
 */
Types.checkObject = function(key, value, modelName, models, iterationLimit, depth) {
	describe(key, function() {
		
        if (_.isArray(value) && !_.size(value)) {
            // Allow empty arrays in stead of empty objects
        } else {
            it("should be an object", function() {
                expect(value).toBeObject();
            });
        }
		
		it("'" + modelName + "' should be in models collection", function() {
            expect(models).toHaveKey(modelName); 
		});
		
		var model = models[modelName];
		if (model && _.isObject(value) && !_.isArray(value)) {
            it("'" + modelName + "' should have properties", function() {
				expect(model.properties).toBeDefined(); 
			});
            
			it("'" + modelName + ".properties' should be an object", function() {
				expect(model.properties).toBeObject(); 
			});
			
			_.each(value, function(value, key) {
				it("[" + key + "] should be a documented property of '"+modelName+"'", function() {
                    expect(model.properties).toHaveKey(key); 
				});
				
				if (model.properties[key]) {
					var property = model.properties[key];
					Types.checkType("[" + key + "]", value, property, models, iterationLimit, depth);
				}
			});
		}
	});
};

/**
 * Types.checkArray
 * Check all of the entires in an array are specified, and that they conform to
 * the type definition.
 * @param {string} key The name of the property we're examining, useful for feedback
 * @param {array} value The value we're examining
 * @param {object} models The collection of models
 * @param {object} typeObject which supplies type information for this check
 * @param {integer} iterationLimit Optionally limit iterations in array and dictionaries
 * @param {integer} depth The recursion depth;
 * @returns {void}
 */
Types.checkArray = function(key, value, models, typeObject, iterationLimit, depth) {
	describe(key, function() {
		var isArray = _.isArray(value);
		
        it("should be an array of " + 
            (typeObject.items.type ? typeObject.items.type : typeObject.items.$ref), 
            function() {
                expect(value).toBeArray();
            }
        );

		if (isArray) {
			_.each(value, function(iterator, idx) {
                if (iterationLimit && idx >= iterationLimit) {
                    return;
                }
                
                if (typeObject.enum) {
                    Types.checkEnum("["+idx+"]", iterator, typeObject.enum);
                } else {
                    Types.checkType("["+idx+"]", iterator, typeObject.items, models, iterationLimit, depth);
                }
			});
		}
	});
};
/**
 * Types.checkDictionary
 * Check all of the entires in a dictionary are specified, and that they conform 
 * to the type definition.
 * @param {string} key The name of the property we're examining, useful for feedback
 * @param {array} value The value we're examining
 * @param {object} models The collection of models
 * @param {object} typeObject which supplies type information for this check
 * @param {integer} iterationLimit Optionally limit iterations in array and dictionaries
 * @param {integer} depth The recursion depth;
 * @returns {void}
 */
Types.checkDictionary = function(key, value, models, typeObject, iterationLimit, depth) {
    describe(key, function() {
        var isObject = _.isObject(value);
        
        if (_.size(value)) { // zero length object can be arrays TODO is this ok, PHP limitation...
            it("should be a dictionary of " + 
                (typeObject.items.type ? typeObject.items.type : typeObject.items.$ref), 
                function() {
                    expect(value).toBeObject();
                }
            );
        } else {
            isObject = false;
        }
        
        if (isObject) {
            var i = 0;
            _.each(value, function(iterator, idx) {
                if (iterationLimit && i++ >= iterationLimit) {
                    return;
                }
                
                if (typeObject.enum) {
                    Types.checkEnum("["+idx+"]", iterator, typeObject.enum);
                } else {
                    Types.checkType("["+idx+"]", iterator, typeObject.items, models, iterationLimit, depth);
                }
            });
        }
    });
};


Types.checkExpectations = function(key, expectations, response) {
    describe(key, function() {
        _.each(expectations, function(expectation) {
            Types.checkExpectation(response, expectation);
        });
    });
};
Types.checkExpectation = function(response, expectation) {
    var path = Types.findExpectationPath(response, expectation);
    
    if (!path.exists) {
        // Only throw this up if the expected key is not present
        it(path.name + " to exist", function() {
            expect(path.exists).toBeTruthy();
        });
    }

    Types.checkExpectationPath(expectation, path.name, path.value, path.exists);
};

/**
 * Use an expectation path to find a specific value in a JSON object. 
 * @param {object} response the JSON object
 * @param {type} expectation
 * @returns {Types.findExpectationPath.route}
 */
Types.findExpectationPath = function(response, expectation) {
    var route = {
        name: "",
        value: response,
        exists: true
    };

    // Traverse the path for the expectation
    _.each(expectation.path, function(key) {
        if (route.exists) {
            route.name += "[" + key + "]";

            if (_.has(route.value, key)) {
                // Move the pointer deeper into the response
                route.value = route.value[key];
            } else {
                route.exists = false;
            }
        }
    });
    
    return route;
};
Types.checkExpectationPath = function(expectation, routeName, route, exists) {
    // If the we have an expected value, check it.
    if (exists && expectation.value) {
        if (_.isArray(expectation.value)) {
            it(routeName + " should be an array", function() {
                expect(route).toBeArray();
            });
            it(routeName + " should contain "+expectation.value.length+" items", function() {
                expect(route.length).toEqual(expectation.value.length);
            });
            _.each(expectation.value, function(iter) {
                it(routeName + " should contain '"+iter+"'", function() {
                    expect(route).toContain(iter);
                });
            });
        } else {
            it(routeName + " to be '" + expectation.value + "'", function() {
                expect(typeof route).toBe(typeof expectation.value);
                expect(route).toBe(expectation.value);
            });
        }
    }
};


Types.customMatchers = {
    toBeGoofy: function(util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                if (expected === undefined) {
                    expected = '';
                }

                var result = {};
                result.pass = util.equals(actual.hyuk, "gawrsh" + expected, customEqualityTesters);

                if (result.pass) {
                    result.message = "Expected " + actual + " not to be quite so goofy";
                } else {
                    result.message = "Expected " + actual + " to be goofy, but it was not very goofy";
                }

                return result;
            }
        };
    },
    toHaveKey: function() {
        return {
            compare: function(value, key) {
                return {
                    pass: _.has(value, key),
                    message: "Expected '" + key + "' to be a property on the object '" + value + "'"
                };
            }
        };
    },
    toBeString: function() {
        return {
            compare: function(value) {
                return {
                    pass: typeof value === "string",
                    message: "Expected " + value + " (" + (typeof value) +  ") to be a string"
                };
            }
        };
    },
    toBeNumber: function() {
        return {
            compare: function(value) {
                return {
                    pass: typeof value === "number",
                    message: "Expected " + value + " (" + (typeof value) +  ") to be a number"
                };
            }
        };
    },
    toBeInteger: function() {
        return {
            compare: function(value) {
                return {
                    pass: value % 1 === 0,
                    message: "Expected " + value + " (" + (typeof value) +  ") to be an integer"
                };
            }
        };
    },
    toBeArray: function() {
        return {
            compare: function(value) {
                return {
                    pass: _.isArray(value),
                    message: "Expected an array, found a " + (typeof value)
                };
            }
        };
    },
    toBeDate: function() {
        return {
            compare: function(value) {
                return {
                    pass: true, // TODO
                    message: "Expected " + value + "(" + (typeof value) +  ") to be a date"
                };
            }
        };
    },
    toBeDateTime: function() {
        return {
            compare: function(value) {
                return {
                    pass: true, // TODO
                    message: "Expected " + value + " (" + (typeof value) +  ") to be a datetime"
                };
            }
        };
    },
    toBeBoolean: function() {
        return {
            compare: function(value) {
                return {
                    pass: value === true || value === false,
                    message: "Expected " + value + " (" + (typeof value) +  ") to be a boolean"
                };
            }
        };
    },
    toBeByte: function() {
        return {
            compare: function(value) {
                return {
                    pass: value === 1 || value === 0,
                    message: "Expected " + value + " (" + (typeof value) +  ") to be a byte"
                };
            }
        };
    },
    toBeObject: function() {
        return {
            compare: function(value) {
                return {
                    pass: _.isObject(value) && !_.isArray(value),
                    message: "Expected an object, found an " + (_.isArray(value) ? "array" : typeof value)
                };
            }
        };
    },/*
    toBeInList: function() {
        return {
            compare: function(value, list) {
                return {
                    pass: _.contains(list, value),
                    message: "Expected '" + value + "' to be in the array [" + list.join(", ") + "]"
                };
            }
        };
    },
    toContain: function() {
        return {
            compare: function(list, value) {
                return {
                    pass: _.contains(list, value),
                    message: "Expected '" + value + "' to be in the array [" + list.join(", ") + "]"
                };
            }
        };
    },*/
    toNotContainReplaceables: function() {
        return {
            compare: function(value) {
                return {
                    pass: value.search(/\{[a-z]+\}/) < 0 &&
                          value.search(/\%7B[a-z]+\%7D/) < 0,
                    message: "Expected '" + value + "' to be free of replaceable {values}"
                };
            }
        };
    },
    toBeSimpleType: function() {
        return {
            compare: function(value) {
                return {
                    pass: typeof value === "string" || 
                          typeof value === "number" || 
                          typeof value === "boolean",
                    message: "Expected '" + value + "' to be a simple type"
                };
            }
        };
    }
};
