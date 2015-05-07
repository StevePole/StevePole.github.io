
var models = {
    env__array: {
        id: "env__array",
        mainParam: "data",
        properties: [{
            name: "data",
            type: "array",
            main: true,
            items: {
                $ref: "model"
            }
        }]
    },
    env__single: {
        id: "env__single",
        mainParam: "data",
        properties: [{
            name: "data",
            type: "model",
            main: true,
            $ref: "model"
        }]
    },
    model: {
        id: "model",
        name: "model",
        properties: {
            not_the_id: {
                name: "not_the_id",
                type: "integer",
                format: "int64"
            },
            id: {
                name: "id",
                type: "integer",
                format: "int64",
                isId: true
            },
            enum_array: {
                name: "enum_array",
                type: "array",
                items: {
                    type: "string",
                    format: "string"
                },
                enum: [
                    "example"
                ]
            },
            enum_dictionary: {
                name: "enum_array",
                type: "array",
                isDictionary: true,
                items: {
                    type: "string",
                    format: "string"
                },
                enum: [
                    "example"
                ]
            }
        }
    }
};

var single_response = {
    not_the_id: false,
    id: 1234567890
};

var array_response = [single_response];

var envelope_single_response = {
    "data": single_response
};

var envelope_array_response = {
    "data": array_response
};

var swagger = new Swagger();

describe("swagger.modelIsEnvelope", function() {
    it("should identify envelope models as an envelope", function() {
        expect(swagger.modelIsEnvelope(models.env__array.id)).toBeTruthy();
        expect(swagger.modelIsEnvelope(models.env__single.id)).toBeTruthy();
    });
    
    it("should identify non envelope models as not envelopes", function() {
        expect(swagger.modelIsEnvelope(models.model.id)).toBeFalsy();
    });
});

describe("swagger.findModelIdProperty", function() {
    it("should find the id in a normal model spec", function() {
        var idProperty = swagger.findModelIdProperty(models.model);
        expect(idProperty).not.toBeFalsy();
        expect(idProperty.name).toBe("id");
    });
    
    it("should find the id in an envelope model spec", function() {
        var idProperty = swagger.findModelIdProperty(models.env__single);
        expect(idProperty).not.toBeFalsy();
        expect(idProperty.name).toBe("data");
    });
});

describe("swagger.findInResponse", function() {
    it("should find the id in a simple object", function() {
        // Single object
        var id = swagger.findIdInResponse(
            models,
            models.model,
            single_response
        );
        expect(id).toBe(1234567890);
    });
    
    it("should find the id in an array of objects", function() {
        /*
        // Array of objects
        var id = swagger.findIdInResponse(
            models,
            ?,
            array_response
        );
        expect(id).toBe(1234567890);
        */
    });
        
    it("should find the id in an object inside an envelope", function() {   
        var id = swagger.findIdInResponse(
            models,
            models.env__single,
            envelope_single_response
        );
        expect(id).toBe(1234567890);
    });
        
    it("should find the id in an array of objects inside an envelope", function() {
        var id = swagger.findIdInResponse(
            models,
            models.env__array,
            envelope_array_response
        );
        expect(id).toBe(1234567890);
    });
});


describe("The type checkers should work", function() {  
    //_.each(Types.customMatchers, function(customMatcher, name) {
    //    jasmine.matchers[name] = customMatcher;
    //});
    
    beforeEach(function() {
        jasmine.addMatchers(Types.customMatchers);
    });
    
    describe("Nestng this...", function() {
        Types.checkInt32("integer", 1234);
        Types.checkString("string", "test", "test");
        Types.checkDouble("double", 1.02, 1.02);
        Types.checkFloat("float", 3.14159, 3.14159);
        Types.checkObject("object", {id: 1, not_the_id: 2}, "model", models);
        Types.checkArray("array", [1,2,3], models, {items:{type:"integer"}});
        Types.checkArray("enum_array", ["example"], models, models.model.properties.enum_array);
        Types.checkDictionary("dictionary", {1:1,2:2,3:3}, models, {items:{type:"integer"}});
        Types.checkDictionary("enum_dictionary", {"example":"example"}, models, models.model.properties.enum_dictionary);
    });
});

describe("swagger.flattenModel", function() {
    beforeEach(function() {
        jasmine.addMatchers(Types.customMatchers);
    });
    
    it("should place the nested model on the envelope's main property", function() {
        swagger.flattenModel(models.env__single, models);
        var nestedProperty = models.env__single.properties[0];
        expect(nestedProperty).toBeObject();
        expect(nestedProperty.model).toBeObject();
        expect(nestedProperty.model.id).toBe("model");
    });
});

