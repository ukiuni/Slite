var express = require('express');
var router = express.Router();
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var AccountInGroup = global.db.AccountInGroup;
var Promise = require("bluebird");
var Random = require(__dirname + "/../../util/random");
var Storage = require(__dirname + "/../../util/storage");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
router.get('/:imageKey', function(req, res) {
	if (!req.params.imageKey || req.params.imageKey.indexOf("/../") > -1) {
		res.status(404).end();
		return;
	}
	Storage.load(req.params.imageKey).then(function(file) {
		if (file.redirectUrl) {
			res.set("Pragma", "no-cache");
			res.redirect(302, file.redirectUrl);
		} else {
			res.set('Content-Type', file.contentType);
			res.status(200).send(file.buffer);
		}
	})["catch"](function(error) {
		console.log(error.stack);
		res.status(404).send();
	});
});
function responseFile(res, name) {
	return function(file) {
		if (name && file.name == name) {
			if (file.redirectUrl) {
				res.set("Pragma", "no-cache");
				res.redirect(302, file.redirectUrl);
			} else {
				res.set('Content-Type', "application/octet-stream");
				res.set('Content-Disposition', 'attachment; filename="' + name + '"');
				res.status(200).send(file.buffer);
			}
		} else if (!name) {
			if (file.redirectUrl) {
				res.set("Pragma", "no-cache");
				res.redirect(302, file.redirectUrl);
			} else {
				res.set('Content-Type', file.contentType);
				res.status(200).send(file.buffer);
			}
		} else {
			res.status(404).end();
		}
	}
}
function getGroupImage(req, res, name) {
	if (!req.params.groupAccessKey || !req.params.imageKey || req.params.imageKey.indexOf("/../") > -1) {
		res.status(404).end();
		return;
	}
	var accessKey = req.query.sessionKey || req.query.access_token || req.cookies["session_key"];
	if (!accessKey) {
		throw ERROR_NOTACCESSIBLE;
	}
	accessKey = accessKey.replace("\"", "").replace("\"", "");// for cookie;
	Group.findAccessible(accessKey, req.params.groupAccessKey).then(function(result) {
		return Storage.load("groups/" + req.params.groupAccessKey + "/" + req.params.imageKey, name).then(responseFile(res, name));
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).send();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).send();
		} else {
			console.log(error.stack);
			res.status(500).send();
		}
	});
}
router.get("/groups/:groupAccessKey/:imageKey", function(req, res) {
	getGroupImage(req, res)
});
router.get("/groups/:groupAccessKey/:imageKey/:name", function(req, res) {
	getGroupImage(req, res, req.params.name)
});
router.post('/groups/:groupAccessKey', function(req, res) {
	if (!req.params.groupAccessKey) {
		res.status(404).end();
		return;
	}
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		throw ERROR_NOTACCESSIBLE;
	}
	var accessAccount;
	Group.findAccessible(accessKey, req.params.groupAccessKey).then(function(result) {
		accessAccount = result.account;
		return Random.createRandomBase62();
	}).then(function(random) {
		return Storage.store("groups/" + req.params.groupAccessKey + "/" + random, req.files.imageFile[0].mimetype, req.body.name, req.files.imageFile[0], accessAccount.id);
	}).then(function(savedImageUrl) {
		res.status(200).send({
			url : savedImageUrl
		});
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).send();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).send();
		} else {
			console.log(error.stack);
			res.status(500).send();
		}
	});
});
function getContentImage(req, res, name) {
	if (!req.params.contentKey || !req.params.imageKey || req.params.imageKey.indexOf("/../") > -1) {
		res.status(404).send();
		return;
	}
	var loadedContent;
	Content.find({
		where : {
			accessKey : req.params.contentKey
		}
	}).then(function(content) {
		if (!content) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedContent = content;
		return ContentBody.find({
			where : {
				ContentId : content.id,
				version : content.currentVersion
			}
		});
	}).then(function(contentBody) {
		if (contentBody.status == ContentBody.STATUS_OPEN || contentBody.status == ContentBody.STATUS_URLACCESS) {
			return new Promise(function(success) {
				success()
			});
		} else {
			var accessKey = req.query.sessionKey || req.query.access_token || req.cookies["session_key"];
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			accessKey = accessKey.replace("\"", "").replace("\"", "");// for
			// cookie;
			return AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
				if (!accessKey) {
					throw ERROR_NOTACCESSIBLE;
				}
				if (accessKey.AccountId == loadedContent.ownerId) {
					return new Promise(function(success) {
						success("authorized")
					});
				} else if (ContentBody.STATUS_AUTHENTICATEDONLY != contentBody.status) {
					throw ERROR_NOTACCESSIBLE;
				}
				return AccountInGroup.find({
					where : {
						GroupId : loadedContent.GroupId,
						AccountId : accessKey.AccountId,
						inviting : Group.INVITING_DONE
					}
				});
			}).then(function(accountInGroup) {
				if (!accountInGroup) {
					throw ERROR_NOTACCESSIBLE;
				}
			});
		}
	}).then(function() {
		return Storage.load(req.params.contentKey + "/" + req.params.imageKey, name).then(responseFile(res, name));
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).send();
		} else {
			console.log(error.stack);
			res.status(500).send();
		}
	});
}
router.get('/:contentKey/:imageKey', function(req, res) {
	getContentImage(req, res);
});
router.get('/:contentKey/:imageKey/:fileName', function(req, res) {
	getContentImage(req, res, req.params.fileName);
});
router.post('/:contentKey', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(403).end();
		return;
	}
	var accessAccount;
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return accessKey.getAccount();
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		accessAccount = account;
		return Random.createRandomBase62();
	}).then(function(random) {
		return Storage.store(req.params.contentKey + "/" + random, req.files.imageFile[0].mimetype, req.body.name, req.files.imageFile[0], accessAccount.id);
	}).then(function(savedImageUrl) {
		res.status(200).send({
			url : savedImageUrl
		});
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).send();
		} else {
			if (error.stack) {
				console.log(error.stack);
			} else {
				console.log(error);
			}
			res.status(500).send();
		}
	});
});
module.exports = router;