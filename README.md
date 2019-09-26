# Jasmine Aquality Tracker Plugin

A plugin to send test results to [Aquality Tracking](https://github.com/aquality-automation/aquality-tracking)

## Installing

`npm i aquality-tracking-reporter-jasmine'

## Using Aquality Tracker Plugin in Jasmine

```js
// conf.js
const AqualityReporter = require('aquality-tracking-reporter-jasmine');
jasmine.getEnv().addReporter(new AqualityReporter({
            token: ${your_api_token},
            api_url: ${your_api_url},
            project_id: ${your_project_id},
            testrun_id: ${testrun_id_for_results}
        }));
```
### Using Aquality Tracker Plugin in Protractor

```js
// conf.js
exports.config = {
  framework: 'jasmine',
  onPrepare: function() {
    const AqualityReporter = require('aquality-tracking-reporter-jasmine');
    jasmine.getEnv().addReporter(new AqualityReporter({
            token: ${your_api_token},
            api_url: ${your_api_url},
            project_id: ${your_project_id},
            testrun_id: ${testrun_id_for_results}
        }));
  }
}
```


## TBD
- Currently attachments are added to the test case instead of the current step. This needs to be fixed in 
 `allure-js-commons`.
- Add support for Features.
- Add support to Jasmine1. Right now only Jasmine2 is available (do we really need this?).
- Add ability to use reflection for decoration method of page objects so that we don't need to write Allure-related
 boilerplate tying ourselves to one specific reporter.
