var request = require('request');
var Promise = require("bluebird");
var fs = require("fs");
var key = fs.readFileSync((process.env.HOME || process.env.USERPROFILE) + "/.gcm/key");
module.exports = {
	push : function(deviceId, data) {
		return new Promise(function(success, fail) {
			request({
				url : "https://android.googleapis.com/gcm/send",
				body : {
					registration_ids : [ deviceId ],
					data : data
				},
				headers : {
					"Authorization" : key,
					"Content-Type" : "application/json"
				}
			}, function(error, response, body) {
				if (error) {
					fail(error);
				} else if (response.statusCode > 400) {
					fail(response);
				} else {
					success(JSON.parse(body));
				}
			});
		});
	}
}