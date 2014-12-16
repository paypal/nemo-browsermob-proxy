# nemo-browsermob-proxy

nemo-browsermob-proxy is a nemo plugin aimed to capture performance data and/or add  custom headers to browsers launched during nemo tests. nemo-browsermob-proxy is based on [browsermob-node][2] which is built on top of [browsermob-proxy][1] api. Once nemo-browsermob-proxy plugin is registered, browser requests
are routed through the proxy. Technically nemo-browsermob-proxy can support all capabilities supported by [browsermob-proxy][1] REST API, however currently it only supports a minimal set of features like starting proxy, collecting HAR, updating headers, stopping proxy etc.
More features will be added based on requests.

## Pre-requisite

You need to install and start the [browsermob-proxy] [1]

    % ./browsermob-proxy --port=8787

## Installation

`npm install nemo-browsermob-proxy --save-dev`

## Nemo Configuration

Add nemo-browsermob-proxy to your `config/nemo-plugins.json` file. Make sure `priority<100` to allow plugin to register
before nemo initializes the driver

``` javascript
 "proxy":{
        "module":"nemo-browsermob-proxy",
        "priority": 99,
        "register": true
    }
```

You can optionally put your proxy preferences like `proxy` property under `nemoData` environment variable like below,

``` javascript
  "nemoData": {
                "proxy": {
                     "host": "localhost", //host where browsermob-proxy is running
                     "port": 8787,  //port on browsermob-proxy is running
                     "proxyPort": 9090
                }
  }
```
The config above is optional. If it's not provided, following default will be applied
``` javascript
 "proxy": {
             "host": "localhost", //host where browsermob-proxy is running
             "port": 8080,  //port on browsermob-proxy is running
             "proxyPort": RETURNED By BMP //whatever available when queried browsermob-proxy
          }
```
## Details
Once nemo-browsermob-proxy plugin is registered, it will start proxy and start grabbing data in HAR format. You can then
set custom headers, run tests etc and then grab the output HAR file for reporting performance metrics. All nemo-browsermob-proxy methods 
return promises, so you can use it's methods along with WebDriverJS/nemo methods. For example,

``` javascript
 var headersToSet = {
            'User-Agent': 'Bananabot/1.0',
            'custom-header1': 'fancy-header1-value',
            'custom-header2': 'custom-header2-value'
 };
  nemo.browserProxy.setHeaders(headersToSet);
  nemo.driver.get('http://www.paypal.com/');
  nemo.browserProxy.writeOutputToHARFile(process.cwd() + '/data.har');
  nemo.browserProxy.stop().then(function(){
       done();
  });
```

[1]: https://github.com/lightbody/browsermob-proxy "browsermob-proxy"
[2]: https://github.com/zzo/browsermob-node "browsermob-node"