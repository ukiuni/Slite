var fs = require('fs');
var path = require('path');
var STORAGE_PATH = "../storage/temp";
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../config/server.json")[env];
var STORAGE_CONTENTTYPE_PATH = "../storage/tempContentType";
var Promise = require("bluebird");
try {
	fs.mkdirSync(path.join(__dirname, "../storage"));
} catch (e) {
}
try {
	fs.mkdirSync(path.join(__dirname, STORAGE_PATH));
} catch (e) {
}
try {
	fs.mkdirSync(path.join(__dirname, STORAGE_CONTENTTYPE_PATH));
} catch (e) {
}
module.exports = {
	store : function(key, contentType, name, data) {
		return new Promise(function(onFulfilled, onRejected) {
			if (key.indexOf("/") > 0) {
				try {
					fs.mkdirSync(path.join(__dirname, STORAGE_PATH, key.split("/")[0]));
				} catch (ignored) {
				}
				try {
					fs.mkdirSync(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key.split("/")[0]));
				} catch (ignored) {
				}
			}
			fs.writeFile(path.join(__dirname, STORAGE_PATH, key), data, function() {
				var paramData = {
					name : name,
					contentType : contentType
				}
				fs.writeFile(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key), JSON.stringify(paramData), {
					encoding : "utf8"
				}, function() {
					onFulfilled(serverConfig.hostURL + "/api/image/" + key);
				});
			});
		});
	},
	load : function(key) {
		return new Promise(function(onFulfilled, onRejected) {
			fs.readFile(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key), {
				encording : "utf8"
			}, function(error, paramData) {
				try {
					var param = JSON.parse(paramData);
					var name = param.name;
					var contentType = param.contentType;
					if (!contentType) {
						contentType = paramData;
					}
				} catch (e) {
					contentType = paramData;
				}
				if (error) {
					onRejected(error);
				} else {
					fs.readFile(path.join(__dirname, STORAGE_PATH, key), function(error, data) {
						if (error) {
							onRejected(error);
						} else {
							onFulfilled({
								contentType : contentType,
								name : name,
								buffer : data
							});
						}
					});
				}
			});
		});
	}
}