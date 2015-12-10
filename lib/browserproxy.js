/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2014 PayPal                                                  │
│                                                                             │
│                                                                             │
│   Licensed under the Apache License, Version 2.0 (the "License"); you may   │
│   not use this file except in compliance with the License. You may obtain   │
│   a copy of the License at http://www.apache.org/licenses/LICENSE-2.0       │
│                                                                             │
│   Unless required by applicable law or agreed to in writing, software       │
│   distributed under the License is distributed on an "AS IS" BASIS,         │
│   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
│   See the License for the specific language governing permissions and       │
│   limitations under the License.                                            │
\*───────────────────────────────────────────────────────────────────────────*/

'use strict';
var Proxy = require('browsermob-proxy').Proxy,
    fs = require('fs');

function BrowserProxy(nemo) {
    this.props = nemo.props;
    this.options = {
        'host': nemo.props && nemo.props.proxy && nemo.props.proxy.host || 'localhost',
        'port': nemo.props && nemo.props.proxy && nemo.props.proxy.port || 8080,
        'proxyPort': nemo.props && nemo.props.proxy && nemo.props.proxy.proxyPort || null
    };
    this.proxy = new Proxy(this.options);
    this.webdriver = nemo.wd;
}
BrowserProxy.prototype = {

    'start': function () {
        var flow = this.webdriver.promise.controlFlow(),
            d = this.webdriver.promise.defer(),
            _this = this;
        flow.execute(function(){
            _this.proxy.start(function (err, data) {
                if (!err) {
                    console.log('Now starting har');
                    _this.proxy.startHAR(data.port, _this.props.targetBaseUrl, function (err, resp) {
                        _this.port = data.port;
                        var selproxy = require('selenium-webdriver/proxy');
                        _this.props.serverCaps.proxy = selproxy.manual({http: _this.options.host + ':' + data.port});
                        if (err) {
                            console.error('Error starting HAR: ' + err);
                            _this.proxy.stop(data.port);
                            d.reject(err);
                        } else {
                            console.log('fulfilled start promise');
                            d.fulfill(resp);
                        }
                    });
                } else {
                    console.error('Error starting proxy: ' + err);
                    d.reject(err);
                }
            });
        });
        return d;
    },
    'stop': function () {
        var flow = this.webdriver.promise.controlFlow(),
            d = this.webdriver.promise.defer(),
            _this = this;
        flow.execute(function(){
            _this.proxy.stop(_this.port, function (err, resp) {
                if (err) {
                    d.reject(err);
                } else {
                    console.log('fulfilled stop promise');
                    d.fulfill(resp);
                }
            });
        });
        return d;
    },
    'writeOutputToHARFile': function (absolutePathHAR) {
        var _this = this,
            flow = this.webdriver.promise.controlFlow(),
            d = this.webdriver.promise.defer();
        flow.execute(function(){
            if (!absolutePathHAR || typeof absolutePathHAR !== 'string') {
                d.reject(new Error('Absolute Path to write HAR file is required'));
                return d;
            }
            _this.proxy.getHAR(_this.port, function (err, resp) {
                if (!err) {
                    fs.writeFileSync(absolutePathHAR, resp, 'utf8');
                    console.log('fulfilled writeOutputToHARFile promise');
                    d.fulfill(resp);
                } else {
                    console.err('Error getting HAR file: ' + err);
                    d.reject(err);
                }
            });
        });
        return d;
    },
    'setHeaders': function (headersToSet) {
        var _this = this,
            flow = this.webdriver.promise.controlFlow(),
            d = this.webdriver.promise.defer();
        flow.execute(function(){
            _this.proxy.addHeader(_this.port, headersToSet, function (err, resp) {
                if (err) {
                    d.reject(err);
                } else {
                    d.fulfill(resp);
                }
            });
        });
        return d;
    }
};
module.exports = BrowserProxy;
