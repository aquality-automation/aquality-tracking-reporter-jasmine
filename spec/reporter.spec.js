const AqualityReporter = require('../src/aqualityReporter');
jasmine.getEnv().addReporter(new AqualityReporter({
        token: 'da0cf462-2278-4468-983d-0e8e6f7352361593591482779',
        api_url: 'http://localhost:8080/api',
        project_id: 1,
        suite: 'Test with auto cteare suite and testrun',
        testrun: { build_name: 'build_1' }
    }));

describe("A suite", function () {
    it("contains spec with an expectation", function () {
        expect(true).toBe(true);
    });

    it("contains spec with an expectation", function () {
        expect(true).toBe(false);
    });
});