describe('Controller: CodesController', function() {
    var controller, $rootScope, BankBranchesService;

    beforeEach(function() {
        // Load the necessary module
        module('swift-app');
        module('swift-app.controllers');
        module('swift-app.services');
        module('swift-app.mocks');

        // underscores in service names are ignored, they let us use the
        // original name for local variables.
        inject(function($controller, _BankBranchesServiceMock_, _$rootScope_) {
            // Retain rootScope to trigger digest and resolve promises.
            $rootScope = _$rootScope_;

            // Retain a reference to the mock service so we can spy on it later
            BankBranchesService = _BankBranchesServiceMock_;

            // Use the controller service to instantiate our controller, pass mock
            controller = $controller('CodesController', {
                BankBranchesService: _BankBranchesServiceMock_
            });
        });
    });

    describe('search()', function() {
        it("should call the bank branches service and list the banks", function() {
            // spyOn replaces the method, callThrough returns the original response
            spyOn(BankBranchesService, 'getByCode').and.callThrough();

            controller.search();

            expect(BankBranchesService.getByCode).toHaveBeenCalled();

            // Force a digest cycle on the rootScope to resolve promises.
            $rootScope.$apply();

            expect(controller.branches).toBeDefined();
            expect(controller.branches.length).toBe(2);

            var bank = controller.branches[0];
            expect(bank.id).toBe(1);
            expect(bank.name).toBe("Mock!");

            bank = controller.branches[1];
            expect(bank.id).toBe(2);
            expect(bank.name).toBe("Another mock?");
        });
    });
});
