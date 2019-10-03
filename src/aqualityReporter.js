const AqalityAPI = require('./aquality.api')
const Status = { PASSED: 2, INPROGRESS: 4, FAILED: 1, PENDING: 5 };

/**
 * @constructor
 * @param {object} config - {token, project_id, testrun_id, api_url}.
 */
class AqualityReporter {
  constructor(config) {
    this.aqalityAPI = new AqalityAPI(config.token, config.project_id, config.api_url)
    this.config = config;
    if(this.config.testrun_id) {
      this.createOrUpdateTestRun({id: this.config.testrun_id})
    }
  }

  /** Prepare Test Suite
   * @param {string} suite_name - Suite name.
   */
  createOrUpdateTestSuite(suite_name) {
    if (suite_name) {
      this.suite = this.aqalityAPI.createOrUpdateSuite({ name: suite_name, project_id: this.config.project_id });
      return this.suite;
    }

    throw new Error('Suite is not defined!');
  }

  /** Prepare Test Run
   * @param {object} test_run - {id, execution_environment, test_suite_id}.
   */
  createOrUpdateTestRun(test_run) {
    this.testrun = test_run;
    this.testrun.project_id = this.config.project_id;
    if (!this.testrun.id) {
      this.testrun.start_time = new Date()
      this.testrun = this.aqalityAPI.createOrUpdateTestRun(this.testrun)
    } else {
      this.existingTestRun = true;
      this.testrun = this.aqalityAPI.getTestRun({ id: this.testrun.id, project_id: this.config.project_id })
    }

    return this.testrun;
  }

  /** Finish Test Run */
  closeTestRun(id) {
    this.test_run = this.createOrUpdateTestRun({id});
    this.test_run.finish_time = new Date();
    return this.aqalityAPI.createOrUpdateTestRun(this.testrun)
  }

  specStarted(result) {
    try {
      this.currentTest = this.aqalityAPI.createOrUpdateTest({
        name: result.fullName,
        project_id: this.config.project_id,
        test_suite_id: this.testrun.test_suite_id,
        suites: [{ id: this.testrun.test_suite_id }]
      })
      this.currentResult = this.aqalityAPI.createOrUpdateResult({
        project_id: this.config.project_id,
        test_id: this.currentTest.id,
        final_result_id: Status.INPROGRESS,
        test_run_id: this.testrun.id,
        start_date: new Date()
      })
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
      this.currentResult.finish_date = new Date();
      this.currentResult = this.aqalityAPI.createOrUpdateResult(this.currentResult)
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
