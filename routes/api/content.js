var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var ContentComment = global.db.ContentComment;
var ContentCommentMessage = global.db.ContentCommentMessage;
var ContentAuthorized = global.db.ContentAuthorized;
var Tag = global.db.Tag;
var Promise = require("bluebird");
var express = require('express');
var router = express.Router();
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
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
	}, {
		model : Tag
	} ]
	this.order = [ [ "updatedAt", "DESC" ] ]
}
router.get('/', function(req, res) {
	var accessKey = req.query.sessionKey || req.query.access_token;
	if (accessKey) {
		AccessKey.find({
			where : {
				secret : accessKey
			}
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
			res.status(200).json(contents);
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
			res.status(200).json(contents);
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
			throw ERROR_NOTFOUND;
		}
		if (ContentBody.STATUS_OPEN == content.ContentBodies[0].status || ContentBody.STATUS_URLACCESS == content.ContentBodies[0].status) {
			res.status(200).json(content);
			return;
		} else {
			var accessKey = req.query.sessionKey || req.query.auth_token;
			AccessKey.find({
				where : {
					secret : accessKey
				}
			}).then(function(accessKey) {
				if (!accessKey) {
					throw ERROR_NOTACCESSIBLE;
				}
				if (accessKey.AccountId == content.ownerId) {
					return new Promise(function(success) {
						success("accessible");
					});
				}
				return ContentAuthorized.find({
					where : {
						ContentId : content.id,
						AccountId : accessKey.AccountId
					}
				});
			}).then(function(accessible) {
				if (!accessible) {
					throw ERROR_NOTACCESSIBLE;
				}
				res.status(200).json(content);
			})["catch"](function(error) {
				console.log(error.stack);
				if (error == ERROR_NOTACCESSIBLE) {
					res.status(403).end();
					return;
				}
				res.status(500).end();
			});
		}
	})["catch"](function(error) {
		if (error == ERROR_NOTACCESSIBLE) {
			res.status(403).end();
		} else if (error == ERROR_NOTFOUND) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.get('/comment/:contentKey', function(req, res) {
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
			throw ERROR_NOTFOUND;
		}
		var commentQuery = {
			model : ContentComment,
			where : {
				ContentId : content.id
			},
			include : [ {
				model : ContentCommentMessage,
				where : [ "'ContentCommentMessages'.'version' = 'ContentComment'.'currentVersion'" ],
				attributes : [ "message" ],
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
		}
		if (ContentBody.STATUS_OPEN == content.ContentBodies[0].status || ContentBody.STATUS_URLACCESS == content.ContentBodies[0].status) {
			ContentComment.findAll(commentQuery).then(function(comments) {
				res.status(200).json(comments);
			})["catch"](function(error) {
				console.log(error.stack);
				res.status(500).end();
				return;
			});
		} else {
			var accessKey = req.query.sessionKey || req.query.auth_token;
			AccessKey.find({
				where : {
					secret : accessKey
				}
			}).then(function(accessKey) {
				if (!accessKey) {
					throw ERROR_NOTACCESSIBLE;
				}
				if (accessKey.AccountId == content.ownerId) {
					return new Promise(function(success) {
						success("accessible");
					});
				}
				return ContentAuthorized.find({
					where : {
						ContentId : content.id,
						AccountId : accessKey.AccountId
					}
				});
			}).then(function(accessible) {
				if (!accessible) {
					throw ERROR_NOTACCESSIBLE;
				}
				ContentComment.findAll(commentQuery).then(function(comments) {
					res.status(200).json(comments);
				})["catch"](function(error) {
					console.log(error.stack);
					res.status(500).end();
					return;
				});
			})["catch"](function(error) {
				console.log(error.stack);
				if (error == ERROR_NOTACCESSIBLE) {
					res.status(403).end();
					return;
				}
				res.status(500).end();
			});
		}
	})["catch"](function(error) {
		if (error == ERROR_NOTACCESSIBLE) {
			res.status(403).end();
		} else if (error == ERROR_NOTFOUND) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
function saveTag(content, tagsString) {
	var dummyPromise = new Promise(function(success) {
		success();
	});
	var appendedTag = [];
	if (tagsString) {
		var tags = tagsString.split(",");
		tags.forEach(function(tag) {
			dummyPromise = dummyPromise.then(function(lastTag) {
				return Tag.findOrCreate({
					where : {
						name : tag
					},
					defaults : {
						name : tag
					}
				}).spread(function(tag, created) {
					appendedTag.push(tag);
				});
			})
		});
	}
	dummyPromise = dummyPromise.then(function() {
		return content.setTags([]);
	});
	dummyPromise = dummyPromise.then(function() {
		appendedTag.forEach(function(tag) {
			dummyPromise = dummyPromise.then(function() {
				content.addTag(tag)
			});
		});
	});
	return dummyPromise;
}
router.post('/', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(403).end();
		return;
	}
	var accessAccount;
	var createdContentAccessKey;
	var createdContent;
	var appendedTag = [];
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
		return ContentBody.create({
			ContentId : createdContent.id,
			updatorId : accessAccount.id,
			version : createdContent.currentVersion,
			title : req.body.title,
			article : req.body.article,
			topImageUrl : req.body.topImageUrl,
			status : req.body.status ? parseInt(req.body.status) : Content.STATUS_OPEN
		});
	}).then(function(contentBody) {
		createdContent.body = contentBody;
		return saveTag(createdContent, req.body.tags);
	}).then(function() {
		res.status(201).json(createdContent);
	})["catch"](function(error) {
		console.log(error.stack);
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
	var lastContentVersion;
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
		lastContentVersion = content.currentVersion;
		return content.increment("currentVersion");
	}).then(function(content) {
		return content.reload();
	}).then(function(content) {
		loadedContent = content;
		return ContentBody.create({
			ContentId : loadedContent.id,
			version : loadedContent.currentVersion,
			title : req.body.title,
			article : req.body.article,
			topImageUrl : req.body.topImageUrl,
			status : req.body.status ? parseInt(req.body.status) : Content.STATUS_OPEN
		});
	}).then(function(contentBody) {
		loadedContent.body = contentBody;
		return saveTag(loadedContent, req.body.tags);
	}).then(function() {
		res.status(201).json(loadedContent);
	})["catch"](function(error) {
		console.log(error.stack);
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			res.status(500).end();
		}
	});
});
router.post('/comment', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(403).end();
		return;
	}
	var accessAccount;
	var accessContent;
	var createdContentComment;
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
		return Content.find({
			where : {
				accessKey : req.body.contentKey
			}
		});
	}).then(function(content) {
		if (!content) {
			throw ERROR_NOTFOUND;
		}
		return ContentComment.create({
			ContentId : content.id,
			ownerId : accessAccount.id,
			currentVersion : 1
		});
	}).then(function(comment) {
		createdContentComment = comment;
		return ContentCommentMessage.create({
			ownerId : accessAccount.id,
			ContentCommentId : comment.id,
			version : comment.currentVersion,
			message : req.body.message
		});
	}).then(function(commentMessage) {
		createdContentComment.message = commentMessage;
		res.status(201).json({
			id : createdContentComment.id,
			owner : accessAccount,
			ContentCommentMessages : [ commentMessage ]
		});
	})["catch"](function(error) {
		console.log(error.stack);
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			res.status(500).end();
		}
	});
});
module.exports = router;