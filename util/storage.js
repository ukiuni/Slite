var fs = require('fs');
var path = require('path');
var STORAGE_PATH = "../storage/temp";
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../config/server.json")[env];
var STORAGE_CONTENTTYPE_PATH = "../storage/tempContentType";
var NotPromise = function() {
	this.then = function(nextFunc) {
		this.nextFunc = nextFunc;
		return this;
	}, this["catch"] = function(errorFunc) {
		this.errorFunc = errorFunc;
		return this;
	}
}
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
	store : function(key, contentType, data) {
		var notPromise = new NotPromise();
		fs.writeFile(path.join(__dirname, STORAGE_PATH, key), data, function() {
			fs.writeFile(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key), contentType, {
				encoding : "utf8"
			}, function() {
				notPromise.nextFunc(serverConfig.hostURL + "/api/image/" + key);
			});
		});
		return notPromise;
	},
	load : function(key) {
		var notPromise = new NotPromise();
		process.nextTick(function() {
			fs.readFile(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key), {
				encording : "utf8"
			}, function(error, contentType) {
				if (error && notPromise.errorFunc) {
					notPromise.errorFunc(error);
				} else {
					fs.readFile(path.join(__dirname, STORAGE_PATH, key), function(error, data) {
						if (error && notPromise.errorFunc) {
							notPromise.errorFunc(error);
						} else {
							try {
								return notPromise.nextFunc(contentType, data);
							} catch (e) {
								if (notPromise.errorFunc) {
									notPromise.errorFunc(e);
								}
							}
						}
					});
				}
			});
		});
		return notPromise;
	}
}