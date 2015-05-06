describe('Controller: BankController', function() {
    var controller, $rootScope, BanksService;

    beforeEach(function() {
        // Load the necessary module
        module('swift-app');
        module('swift-app.controllers');
        module('swift-app.services');
        module('swift-app.mocks');

        // Override objects passed by dependency injection $provider
        // (this must be done before we start using inject)
        module('swift-app', function($provide) {
            $provide.value('$routeParams', {bank: 1});

            // Ideally we would override services with our pre-written mocks
            // However, we cannot use inject to get the mock until later
        });

        // underscores in service names are ignored, they let us use the
        // original name for local variables.
        inject(function($controller, _BanksServiceMock_, _$rootScope_) {
            // Retain a reference to the rootScope so we can trigger a digest
            // cycle to resolve promises.
            $rootScope = _$rootScope_;

            // Retain a reference to the mock service so we can spy on it later
            BanksService = _BanksServiceMock_;

            // Use the controller service to instantiate our controller
            // DI works as normal, but we must pass our mock service explicitly
            controller = $controller('BankController', {
                BanksService: _BanksServiceMock_
            });
        });
    });

    describe('init()', function() {
        it("should call the resource service and load a resource", function() {
            // spyOn replaces the method, callThrough returns the original response
            spyOn(BanksService, 'get').and.callThrough();

            controller.init();

            expect(BanksService.get).toHaveBeenCalled();
            expect(BanksService.get).toHaveBeenCalledWith(1);

            // Force a digest cycle on the rootScope to resolve promises.
            $rootScope.$apply();

            expect(controller.bank.id).toBe(1);
            expect(controller.bank.name).toBe("Mock!");
        });
    });
});
