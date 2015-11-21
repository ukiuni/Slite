var fs = require('fs');
var path = require('path');
var STORAGE_PATH = "../storage/temp";
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../config/server.json")[env];
var Promise = require("bluebird");
var File = global.db.File;
if (serverConfig.s3) {
	var AWS = require('aws-sdk');
	AWS.config.region = serverConfig.s3.region;
	var s3 = new AWS.S3();
	module.exports = {
		store : function(key, contentType, name, file) {
			var serviceKey;
			return new Promise(function(success, fail) {
				serviceKey = key;
				if (name) {
					serviceKey = key + "/" + name;
				}
				s3.putObject({
					Bucket : serverConfig.s3.bucket,
					Key : serviceKey,
					Body : file.buffer,
					ContentLength : file.size,
					ContentType : contentType,
					ACL : "authenticated-read"
				}, function(err, data) {
					if (err) {
						fail(err);
					} else {
						success(data)
					}
				});
			}).then(function() {
				return File.create({
					accessKey : key,
					contentType : contentType,
					name : name,
					size : file.size,
					service : File.SERVICE_S3,
					serviceKey : serviceKey
				});
			}).then(function() {
				return new Promise(function(success) {
					var url = serverConfig.hostURL + "/api/image/" + key;
					url = name ? url + "/" + name : url;
					success(url);
				})
			});
		},
		load : function(key, name) {
			return File.find({
				where : {
					accessKey : key
				}
			}).then(function(file) {
				return new Promise(function(success, fail) {
					if (!file) {
						fail();
						return;
					}
					try {
						var params = {
							Bucket : serverConfig.s3.bucket,
							Key : file.serviceKey,
							Expires : 60,
						}
						if (name) {
							params.ResponseContentType = "application/octet-stream";
							params.ResponseContentDisposition = 'attachment; filename="' + encodeURIComponent(name) + '"';
						}
						s3.getSignedUrl('getObject', params, function(err, url) {
							if (err) {
								fail(err);
							} else {
								file.redirectUrl = url;
								success(file);
							}
						});
					} catch (e) {
						fail(e);
					}
				});
			});
		}
	}
} else {
	var STORAGE_CONTENTTYPE_PATH = "../storage/tempContentType";
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
		store : function(key, contentType, name, file) {
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
				fs.writeFile(path.join(__dirname, STORAGE_PATH, key), file.buffer, function() {
					var paramData = {
						name : name,
						contentType : contentType
					}
					fs.writeFile(path.join(__dirname, STORAGE_CONTENTTYPE_PATH, key), JSON.stringify(paramData), {
						encoding : "utf8"
					}, function() {
						var url = serverConfig.hostURL + "/api/image/" + key;
						url = name ? url + "/" + name : url;
						onFulfilled(url);
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
}