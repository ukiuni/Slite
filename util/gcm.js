var request = require('request');
var Promise = require("bluebird");
var fs = require("fs");
var key;
try {
	key = ("" + fs.readFileSync((process.env.HOME || process.env.USERPROFILE) + "/.gcm/key")).replace("\r", "").replace("\n", "");
} catch (ignored) {
}
module.exports = {
	push : function(deviceId, data) {
		if (!key) {
			throw "No GCM key specified in ~/.gcm/key";
		}
		return new Promise(function(success, fail) {
			request({
				url : "https://android.googleapis.com/gcm/send",
				method : 'POST',
				body : {
					registration_ids : [ deviceId ],
					data : data
				},
				headers : {
					"Authorization" : key,
					"Content-Type" : "application/json"
				},
				json : true
			}, function(error, response, body) {
				if (error) {
					fail(error);
				} else if (response.statusCode > 400) {
					fail(response);
				} else {
					success(body);
				}
			});
		});
	}
}