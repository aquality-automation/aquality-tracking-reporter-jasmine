const request = require('sync-request');

class AqualityAPI {
    constructor(token, projectId, apiURL) {
        this.token = token;
        this.projectId = projectId
        this.host = apiURL;
    }

    _createAuthHeaderValue() {
        return `Basic ${Buffer.from(`project:${this.projectId}:${this.token}`).toString('base64')}`;
    };

    _serializeToQueryString(object) {
        if (!object) {
            return '';
        }
        const str = [];
        for (const proprty in object) {
            if (object.hasOwnProperty(proprty)) {
                str.push(encodeURIComponent(proprty) + '=' + encodeURIComponent(object[proprty]));
            }
        }
        return `?${str.join('&')}`;
    };

    _getFullURL(endpoint, params) {
        return this.host + endpoint + this._serializeToQueryString(params);
    };

    _sendGet(endpoint, params) {
        try {
            const resp = request('GET', this._getFullURL(endpoint, params), {
                headers: {
                    'Authorization': this._createAuthHeaderValue(),
                    'Accept': 'application/json'
                }
            })
            return JSON.parse(resp.getBody('utf8'));
        } catch (error) {
            console.log(error)
            throw new Error(`Was not able to get ${endpoint}`);
        }
    };

    _sendPost(endpoint, params, body) {
        try {
            const resp = request('POST', this._getFullURL(endpoint, params),
                {
                    headers: {
                        'Authorization': this._createAuthHeaderValue(),
                        'Accept': 'application/json'
                    },
                    json: body
                })
            return JSON.parse(resp.getBody('utf8'));
        } catch (error) {
            throw new Error(`Was not able to create ${endpoint}: ${error.headers.errormessage}\n
        URL: ${this._getFullURL(endpoint, params)}\n
        body:${JSON.stringify(body)}`);
        }
    };

    _createTestRun(testRun) {
        return this._sendPost('/testrun', undefined, testRun);
    };

    _getTestRuns(testRun) {
        return this._sendGet('/testrun', testRun);
    };

    _getSuites(testSuite) {
        return this._sendGet('/suite', testSuite);
    };

    _createSuite(testSuite) {
        return this._sendPost('/suite', undefined, testSuite);
    };

    _getTests(test) {
        return this._sendGet('/test', test);
    };

    _getResults(testResult) {
        return this._sendGet('/testresult', testResult);
    };

    _postResult(testResult) {
        return this._sendPost('/testresult', undefined, testResult);
    };

    _postTest(test) {
        return this._sendPost('/test', undefined, test);
    };

    createOrUpdateSuite(suite) {
        const suites = this._getSuites(suite);
        if (suites.length > 0) {
            return suites[0]
        } else {
            return this._createSuite(suite)
        }
    }

    getTestRun(testrun) {
        const testruns = this._getTestRuns(testrun);
        if(testruns && testruns.length > 0){
            return testruns[0]
        }

        throw new Error(`This test run does not exist!`)
    }

    createOrUpdateTestRun(testrun) {
        return this._createTestRun(testrun);
    }

    createOrUpdateTest(test) {
        const tests = this._getTests({name: test.name, project_id: test.project_id});
        if (tests.length > 0) {
            const oldtest = tests[0];
            if (oldtest.suites && oldtest.suites.length > 0) {
                const existingSuite = oldtest.suites.find(x => x.id === test.test_suite_id);
                if (existingSuite) {
                    return oldtest;
                }
                oldtest.suites.push(test.suites[0]);
                return this._postTest(oldtest);
            }
            oldtest.suite = test.suites;
            return this._postTest(oldtest);

        } else {
            return this._postTest(test)
        }
    }

    createOrUpdateResult(result) {
        const results = this._getResults({ test_id: result.test_id, test_run_id: result.test_run_id, project_id: result.project_id });
        if (results.length > 0) {
            const oldresult = results[0];
            result.id = oldresult.id;
            return this._postResult(result);
        } else {
            return this._postResult(result)
        }
    }
}

module.exports = AqualityAPI;
