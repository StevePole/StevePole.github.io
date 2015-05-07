describe('Controller: BanksController', function() {
    var controller, $rootScope, BanksService;

    beforeEach(function() {
        // Load the necessary module
        module('swift-app');
        module('swift-app.controllers');
        module('swift-app.services');
        module('swift-app.mocks');

        // underscores in service names are ignored, they let us use the
        // original name for local variables.
        inject(function($controller, _BanksServiceMock_, _$rootScope_) {
            // Retain rootScope to trigger digest and resolve promises.
            $rootScope = _$rootScope_;

            // Retain a reference to the mock service so we can spy on it later
            BanksService = _BanksServiceMock_;

            // Use the controller service to instantiate our controller, pass mock
            controller = $controller('BanksController', {
                BanksService: _BanksServiceMock_
            });
        });
    });

    describe('search()', function() {
        it("should call the banks service and list the banks", function() {
            // spyOn replaces the method, callThrough returns the original response
            spyOn(BanksService, 'getByName').and.callThrough();

            controller.search();

            expect(BanksService.getByName).toHaveBeenCalled();

            // Force a digest cycle on the rootScope to resolve promises.
            $rootScope.$apply();

            expect(controller.banks).toBeDefined();
            expect(controller.banks.length).toBe(2);

            var bank = controller.banks[0];
            expect(bank.id).toBe(1);
            expect(bank.name).toBe("Mock!");

            bank = controller.banks[1];
            expect(bank.id).toBe(2);
            expect(bank.name).toBe("Another mock?");
        });
    });
});
