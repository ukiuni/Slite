var express = require('express');
var router = express.Router();
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var AccountInGroup = global.db.AccountInGroup;
var Promise = require("bluebird");
var Random = require(__dirname + "/../../util/random");
var ImageTrimmer = require(__dirname + "/../../util/imageTrimmer");
var Storage = require(__dirname + "/../../util/storage");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
router.get('/:imageKey', function(req, res) {
	if (!req.params.imageKey || req.params.imageKey.indexOf("/../") > -1) {
		res.status(404).send();
		return;
	}
	Storage.load(req.params.imageKey).then(function(data) {
		res.set('Content-Type', data.contentType);
		res.status(200).send(data.buffer);
	})["catch"](function(error) {
		res.status(404).send();
	});
})
router.get('/:contentKey/:imageKey', function(req, res) {
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
			return;
		} else {
			var accessKey = req.body.sessionKey || req.body.access_token;
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			return AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
				if (accessKey.AccountId == loadedContent.ownerId) {
					return new Promise(function(success) {
						success("authorized")
					});
				} else if (ContentBody.STATUS_AUTHENTICATEDONLY != content.ContentBodies[0].status) {
					throw ERROR_NOTACCESSIBLE;
				}
				return AccountInGroup.find({
					where : {
						GroupId : content.GroupId,
						AccountId : accessKey.AccountId
					}
				});
			}).then(function(accountInGroup) {
				if (!accountInGroup) {
					throw ERROR_NOTACCESSIBLE;
				}
			});
		}
	}).then(function() {
		return Storage.load(req.params.contentKey + "/" + req.params.imageKey).then(function(data) {
			res.set('Content-Type', data.contentType);
			res.status(200).send(data.buffer);
		})
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).send();
		} else {
			console.log(error.stack);
			res.status(500).send();
		}
	});
});
router.post('/:contentKey', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(403).end();
		return;
	}
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
		imageFileKey = random;
		return ImageTrimmer.trim(req.files.imageFile[0].buffer, 100, 100);
	}).then(function(image) {
		return Storage.store(req.params.contentKey + "/" + imageFileKey, image.contentType, image.buffer);
	}).then(function(savedImageUrl) {
		res.status(200).send({
			url : savedImageUrl
		});
	})["catch"](function(error) {
		console.trace(error);
		res.status(500).send();
	});
});
module.exports = router;