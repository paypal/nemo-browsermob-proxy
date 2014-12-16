var BrowserProxy = require("../lib/browserproxy"),
    assert=require('assert');
describe("nemo-browsermob-proxy ", function () {
	it("should get set up", function (done) {
        var browserMobProxy = new BrowserProxy({});
        assert.notEqual(null,browserMobProxy.options,'Options should have been set');
        done();
	});
});