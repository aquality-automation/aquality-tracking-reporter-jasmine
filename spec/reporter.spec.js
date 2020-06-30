const AqualityReporter = require('../src/aqualityReporter');
jasmine.getEnv().addReporter(new AqualityReporter({
        token: '63a17f56-5d10-49c7-8c0f-1aa55410b5291593421936892',
        api_url: 'http://localhost:8080/api',
        project_id: 30,
        testrun_id: 122
    }));

describe("A suite", function () {
    it("contains spec with an expectation", function () {
        expect(true).toBe(true);
    });

    it("contains spec with an expectation", function () {
        expect(true).toBe(false);
    });
});