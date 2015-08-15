var crypto = require('crypto');
var Promise = require("bluebird");
module.exports = {
	createRandomBase62 : function(length) {
		return new Promise(function(onFulfilled, onRejected) {
			crypto.randomBytes(length || 48, function(ex, buf) {
				var base62 = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
				onFulfilled(base62);
			});
		});
	}
}