const AqalityAPI = require('./aquality.api')
const Status = { PASSED: 2, INPROGRESS: 4, FAILED: 1, PENDING: 5 };

/**
 * @constructor
 * @param {object} config - {token, project_id, testrun_id, api_url}.
 */
class AqualityReporter {
  constructor(config) {
    this.aqalityAPI = new AqalityAPI(config.token, config.project_id, config.api_url);
    this.config = config;
    if (this.config.testrun_id) {
      console.log(`Getting ${this.config.testrun_id} testrun for ${this.config.project_id} project.`);
      const testruns = this.aqalityAPI.getTestrun(config.project_id, this.config.testrun_id);
      if (testruns.length > 0) {
        this.testrun = [0];
      }
    }

    if (!this.testrun) {
      this.suite = this.createOrUpdateTestSuite(this.config.suite);
      this.config.testrun.test_suite_id = this.suite.id
      this.testrun = this.startTestrun(this.config.testrun)
    }

    console.log(`Test Run is ${JSON.stringify(this.testrun)}`);
  }

  /** Prepare Test Suite
   * @param {string} suite_name - Suite name.
   */
  createOrUpdateTestSuite(suite_name) {
    if (suite_name) {
      console.log(`Setting suite ${suite_name} for ${this.config.project_id} project.`);
      this.suite = this.aqalityAPI.createOrUpdateSuite({ name: suite_name, project_id: this.config.project_id });
      return this.suite;
    }

    throw new Error('Suite is not defined!');
  }

  /** Finish Test Run */
  finishTestrun(id) {
    console.log(`Finishing ${id ? id : this.testrun.id} testrun for ${this.config.project_id} project.`);
    return this.aqalityAPI.finishTestrun(id ? id : this.testrun.id, this.config.project_id);
  }

  startTestrun(testrun) {
    console.log(`Starting testrun for ${this.config.project_id} project.`);
    testrun.project_id = this.config.project_id;
    return this.aqalityAPI.startTestrun(testrun);
  }

  addAttachment(result) {
    console.log(`Adding attach for ${result.id} result`);
    return this._finishResults(result);
  };

  specStarted(result) {
    try {
      console.log(`Setting ${result.fullName} test for ${this.config.project_id} project and ${this.testrun.test_suite_id} suite.`);
      this.currentTest = this.aqalityAPI.createOrUpdateTest({
        name: result.fullName,
        project_id: this.config.project_id,
        suites: [{ id: this.testrun.test_suite_id }]
      });
      console.log(`Starting result for ${this.currentTest.id} test for ${this.config.project_id} project and ${this.testrun.id} testrun.`);
      this.currentResult = this.aqalityAPI.startResult(this.currentTest.id, this.testrun.id, this.config.project_id)
    } catch (err) {
      console.log(err)
    }
  }

  specDone(result) {
    try {
      this.currentResult.final_result_id = this._getTestcaseStatus(result.status);
      if (this.currentResult.final_result_id !== Status.PASSED) {
        const error = this._getTestcaseError(result);
        this.currentResult.fail_reason = error.message;
        this.currentResult.log = error.stack;
      }
      console.log(`Finishing result for ${this.currentResult.id} result for ${this.config.project_id} project and ${this.testrun.id} testrun.`);
      this.currentResult = this.aqalityAPI.finishResult(this.currentResult)
      this.finishTestrun(this.testrun.id);
    } catch (err) {
      console.log(err)
    }
  }

  _getTestcaseStatus(status) {
    if (status === 'disabled' || status === 'pending') {
      return Status.PENDING;
    } else if (status === 'passed') {
      return Status.PASSED;
    } else {
      return Status.FAILED;
    }
  };

  _getTestcaseError(result) {
    if (result.status === 'disabled') {
      return {
        message: 'This test was ignored',
        stack: ''
      };
    } else if (result.status === 'pending') {
      return {
        message: result.pendingReason,
        stack: ''
      };
    }
    var failure = result.failedExpectations ? result.failedExpectations[0] : null;
    if (failure) {
      return {
        message: failure.message,
        stack: failure.stack
      };
    }
  };
}

module.exports = AqualityReporter;
