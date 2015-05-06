describe('Controller: CountryController', function() {
    var controller, $rootScope, CountriesService, BanksService;

    beforeEach(function() {
        // Load the necessary module
        module('swift-app');
        module('swift-app.controllers');
        module('swift-app.services');
        module('swift-app.mocks');

        // Override objects passed by dependency injection $provider
        // (this must be done before we start using inject)
        module('swift-app', function($provide) {
            $provide.value('$routeParams', {country: "united-kingdom"});

            // Ideally we would override services with our pre-written mocks
            // However, we cannot use inject to get the mock until later
        });

        // underscores in service names are ignored, they let us use the
        // original name for local variables.
        inject(function($controller, _CountriesServiceMock_, _BanksServiceMock_, _$rootScope_) {
            // Retain a reference to the rootScope so we can trigger a digest
            // cycle to resolve promises.
            $rootScope = _$rootScope_;

            // Retain a reference to the mock service so we can spy on it later
            CountriesService = _CountriesServiceMock_;
            BanksService = _BanksServiceMock_;

            // Use the controller service to instantiate our controller
            // DI works as normal, but we must pass our mock service explicitly
            controller = $controller('CountryController', {
                CountriesService: _CountriesServiceMock_,
                BanksService: _BanksServiceMock_
            });
        });
    });

    describe('init()', function() {
        it("should call the resource services and resources", function() {
            // spyOn replaces the method, callThrough returns the original response
            spyOn(CountriesService, 'get').and.callThrough();
            spyOn(CountriesService, 'list').and.callThrough();
            spyOn(BanksService, 'getByCountry').and.callThrough();

            controller.init();

            expect(CountriesService.get).toHaveBeenCalled();
            expect(CountriesService.get).toHaveBeenCalledWith("united-kingdom");

            expect(CountriesService.get).toHaveBeenCalled();

            expect(BanksService.getByCountry).toHaveBeenCalled();
            expect(BanksService.getByCountry).toHaveBeenCalledWith("united-kingdom");

            // Force a digest cycle on the rootScope to resolve promises.
            $rootScope.$apply();

            expect(controller.country.id).toBe("united-kingdom");
            expect(controller.country.name).toBe("United Kingdom");

            //expect(angular.isArray(controller.countries)).toBeTrue();
            expect(controller.countries.length).toBe(2);

            //expect(angular.isArray(controller.banks)).toBeTrue();
            expect(controller.banks.length).toBe(2);
        });
    });
});
