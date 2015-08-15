var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var express = require('express');
var router = express.Router();
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var Random = require(__dirname + "/../../util/random");
var ImageTrimmer = require(__dirname + "/../../util/imageTrimmer");
var Storage = require(__dirname + "/../../util/storage");
function FindContentCriteria() {
	this.include = [ {
		model : ContentBody,
		where : [ "'ContentBodies'.'version' = 'Content'.'currentVersion'" ],
		attributes : [ "title", "topImageUrl", "status" ],
		include : [ {
			model : Account,
			as : "updator",
			attributes : [ "name", "iconUrl" ]
		} ]
	}, {
		model : Account,
		as : "owner",
		attributes : [ "name", "iconUrl" ]
	} ]
	this.order = [ [ "updatedAt", "DESC" ] ]
}
router.get('/', function(req, res) {
	console.log("rootGetAccessed");
	var accessKey = req.query.sessionKey || req.query.access_token;
	if (accessKey) {
		AccessKey.find({
			secret : accessKey
		}).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			var findAllContentCriteria = new FindContentCriteria();
			findAllContentCriteria.where = {
				ownerId : accessKey.AccountId
			}
			return Content.findAll(findAllContentCriteria);
		}).then(function(contents) {
			res.status(200).json({
				contents : contents
			});
		})["catch"](function(error) {
			console.trace(error)
			if (ERROR_NOTACCESSIBLE == error) {
				res.status(403).end();
			} else {
				res.status(500).end();
			}
		})
	} else {
		var findContentCriteria = new FindContentCriteria();
		findContentCriteria.include[0].where.push("'ContentBodies'.'version' = " + Content.STATUS_OPEN)
		Content.findAll(findContentCriteria).then(function(contents) {
			res.status(200).json({
				contents : contents
			});
		})["catch"](function(error) {
			console.trace(error)
			if (ERROR_NOTACCESSIBLE == error) {
				res.status(403).end();
			} else {
				res.status(500).end();
			}
		})
	}
})
router.get('/:contentKey', function(req, res) {
	if (!req.params.contentKey) {
		res.status(404).send();
		return;
	}
	var findContentCriteria = new FindContentCriteria();
	findContentCriteria.where = {
		accessKey : req.params.contentKey
	};
	delete findContentCriteria.include[0].attributes;
	Content.find(findContentCriteria).then(function(content) {
		if (!content) {
			throw ERROR_NOTACCESSIBLE;
		}
		if (ContentBody.STATUS_AUTHENTICATEDONLY != content.ContentBodies[0].type) {
			res.status(200).json(content);
			return;
		} else {
			var accessKey = req.params.sessiontKey || req.params.auth_token;
			AccessKey.find({
				where : {
					secret : accessKey
				}
			}).then(function(accessKey) {
				if (!accessKey) {
					throw ERROR_NOTACCESSIBLE;
				}
				return content.isAccessible(accessKey.AccountId);
			}).then(function(accessible) {
				if (!accessible) {
					throw ERROR_NOTACCESSIBLE;
				}
				res.status(200).json(content);
			})["catch"](function(error) {
				console.trace(error);
				if (error == ERROR_NOTACCESSIBLE) {
					res.status(403).end();
					return;
				}
				res.status(500).end();
			});
		}
	})["catch"](function(error) {
		// console.trace(error);
		throw error
		if (error == ERROR_NOTACCESSIBLE) {
			res.status(403).end();
			return;
		}
		res.status(500).end();
	});
});
router.post('/', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(403).end();
		return;
	}
	var accessAccount;
	var createdContentAccessKey;
	var createdContent;
	AccessKey.find({
		where : {
			secret : accessKey
		}
	}).then(function(accessKey) {
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
	}).then(function(contentAccessKey) {
		createdContentAccessKey = contentAccessKey;
		return Content.create({
			ownerId : accessAccount.id,
			accessKey : createdContentAccessKey,
			currentVersion : 1
		});
	}).then(function(content) {
		createdContent = content;
		if (!(req.files.imageFile && req.files.imageFile[0] && req.files.imageFile[0].buffer)) {
			console.log("------------ --1");
			return;
		}
		console.log("-------------0 ");
		var trimmedImage;
		return ImageTrimmer.trim(req.files.imageFile[0].buffer, 100, 100).then(function(image) {
			console.log("-------------1 " + JSON.stringify(image));
			trimmedImage = image;
			return Random.createRandomBase62();
		}).then(function(imageFileKey) {
			console.log("-------------2 " + JSON.stringify(imageFileKey));
			return Storage.store(imageFileKey, trimmedImage.contentType, trimmedImage.buffer);
		});
	}).then(function(savedImageUrl) {
		return ContentBody.create({
			ContentId : createdContent.id,
			updatorId : accessAccount.id,
			version : createdContent.currentVersion,
			title : req.body.title,
			article : req.body.article,
			topImageUrl : savedImageUrl,
			status : req.body.status ? parseInt(req.body.status) : Content.STATUS_OPEN
		});
	}).then(function(contentBody) {
		createdContent.body = contentBody;
		res.status(201).json(createdContent);
	})["catch"](function(error) {
		console.trace(error)
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			res.status(500).end();
		}
	});
});
router.put('/', function(req, res) {
	if (!req.body.contentKey || (!req.body.sessionKey && !req.body.access_token)) {
		res.status(404).send();
		return;
	}
	var loadedAccessKey;
	var loadedContent;
	AccessKey.find({
		where : {
			secret : req.body.sessionKey || req.body.access_token
		}
	}).then(function(accessKey) {
		if (!accessKey || !(AccessKey.TYPE_SESSION == accessKey.type || AccessKey.TYPE_LOGIN == accessKey.type)) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccessKey = accessKey;
		return Content.find({
			where : {
				accessKey : req.body.contentKey
			}
		})
	}).then(function(content) {
		if (!content || loadedAccessKey.AccountId != content.ownerId) {
			throw ERROR_NOTACCESSIBLE;
		}
		return content.increment("currentVersion");
	}).then(function(content) {
		return content.reload();
	}).then(function(content) {
		loadedContent = content;
		return ContentBody.create({
			ContentId : content.id,
			version : content.currentVersion,
			title : req.body.title,
			article : req.body.article,
			topImageUrl : req.query.topImageUrl,
			status : req.body.status
		});
	}).then(function(contentBody) {
		loadedContent.body = contentBody;
		res.status(201).json(loadedContent);
	})["catch"](function(error) {
		console.trace(error);
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			res.status(500).end();
		}
	});
});
module.exports = router;