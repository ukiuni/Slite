var request = require('request');
var Promise = require("bluebird");
var fs = require("fs");
var key = ("" + fs.readFileSync((process.env.HOME || process.env.USERPROFILE) + "/.gcm/key")).replace("\r", "").replace("\n", "");
module.exports = {
	push : function(deviceId, data) {
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