describe('Controller: CountriesController', function() {
    var controller, $rootScope, CountriesService;

    beforeEach(function() {
        // Load the necessary module
        module('swift-app');
        module('swift-app.controllers');
        module('swift-app.services');
        module('swift-app.mocks');

        // underscores in service names are ignored, they let us use the
        // original name for local variables.
        inject(function($controller, _CountriesServiceMock_, _$rootScope_) {
            // Retain rootScope to trigger digest and resolve promises.
            $rootScope = _$rootScope_;

            // Retain a reference to the mock service so we can spy on it later
            CountriesService = _CountriesServiceMock_;

            // Use the controller service to instantiate our controller, pass mock
            controller = $controller('CountriesController', {
                CountriesService: _CountriesServiceMock_
            });
        });
    });

    describe('init()', function() {
        it("should call the resource service and list the countries", function() {
            // spyOn replaces the method, callThrough returns the original response
            spyOn(CountriesService, 'list').and.callThrough();

            controller.init();

            expect(CountriesService.list).toHaveBeenCalled();

            // Force a digest cycle on the rootScope to resolve promises.
            $rootScope.$apply();

            expect(controller.countries).toBeDefined();
            expect(controller.countries.length).toBe(2);

            var resource = controller.countries[0];
            expect(resource.id).toBe("united-kingdom");
            expect(resource.name).toBe("United Kingdom");

            resource = controller.countries[1];
            expect(resource.id).toBe(2);
            expect(resource.name).toBe("Another mock?");
        });
    });
});
