# Jasmine Aquality Tracker Plugin

A plugin to send test results to [Aquality Tracking](https://github.com/aquality-automation/aquality-tracking)

## Installing

`npm i @aquality-automation/aquality-tracking-reporter-jasmine`

## Using Aquality Tracker Plugin in Jasmine

```js
// conf.js
const AqualityReporter = require('@aquality-automation/aquality-tracking-reporter-jasmine');
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
    const AqualityReporter = require('@aquality-automation/aquality-tracking-reporter-jasmine');
    jasmine.getEnv().addReporter(new AqualityReporter({
            token: ${your_api_token},
            api_url: ${your_api_url},
            project_id: ${your_project_id},
            testrun_id: ${testrun_id_for_results}
        }));
  }
}
```
