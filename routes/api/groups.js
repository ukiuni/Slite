var express = require('express');
var router = express.Router();
var AccessKey = global.db.AccessKey;
var AccountInGroup = global.db.AccountInGroup;
var Account = global.db.Account;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
var ERROR_DUPLICATED = "ERROR_DUPLICATED";
var sendmail = require('sendmail')();
var Promise = require("bluebird");
var renderer = require('ect')({
	root : './res/template'
});
router.get('/self', function(req, res) {
	var accessKey = req.query.sessionKey || req.query.access_token;
	if (!accessKey) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		return account.getGroups();
	}).then(function(groups) {
		res.status(200).json(groups);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.post('/', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var createdGroup;
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return Group.create({
			name : req.body.name,
			description : req.body.description,
			imageUrl : req.body.imageUrl,
			visibility : req.body.visibility
		})
	}).then(function(group) {
		createdGroup = group;
		return group.addAccount(loadedAccount, {
			authorization : Account.AUTHORIZATION_ADMIN,
			inviting : Group.INVITING_DONE
		});
	}).then(function(group) {
		res.status(200).json(createdGroup);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.put('/', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return AccountInGroup.find({
			where : {
				AccountId : account.id,
				GroupId : req.body.id
			}
		})
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Group.findById(req.body.id)
	}).then(function(group) {
		group.name = req.body.name;
		group.description = req.body.description;
		group.imageUrl = req.body.imageUrl;
		group.visibility = req.body.visibility;
		return group.save();
	}).then(function(group) {
		res.status(200).json(group);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.get('/:id', function(req, res) {
	Group.findById(req.params.id, {
		include : [ {
			model : Account,
			attribute : [ "name", "iconUrl" ]
		}, {
			model : Content,
			require : false,
			include : [ {
				model : Account,
				as : "owner"
			}, {
				model : ContentBody,
				attributes : [ "title", "topImageUrl", "status" ],
				where : [ "'Contents.ContentBodies'.'version' = 'Contents'.'currentVersion'" ],
				required : false,
				include : [ {
					model : Account,
					as : "updator",
					attributes : [ "name", "iconUrl" ]
				} ],
				order : "updatedAt"
			} ]
		} ]
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		if (group.visiblility == Group.VISIBILITY_OPEN) {
			res.status(200).json(group);
			return;
		}
		var accessKey = req.query.sessionKey || req.query.access_token;
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		var loadedAccessKey;
		AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedAccessKey = accessKey;
			return group.getAccounts();
		}).then(function(accounts) {
			for (var i = 0; i < accounts.length; i++) {
				if (accounts[i].id == loadedAccessKey.AccountId) {
					res.status(200).json(group);
					return;
				}
				throw ERROR_NOTACCESSIBLE;
			}
		})["catch"](function(error) {
			if (ERROR_NOTACCESSIBLE == error) {
				res.status(403).end();
			} else if (ERROR_NOTFOUND == error) {
				res.status(404).end();
			} else {
				console.log(error.stack);
				res.status(500).end();
			}
		});
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.post('/:id/invite', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var targetAccount;
	var loadedGroup;
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return accessKey.getAccount();
	}).then(function(account) {
		loadedAccount = account;
		return AccountInGroup.find({
			where : {
				AccountId : account.id,
				GroupId : req.params.id
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Group.findById(req.params.id);
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		loadedGroup = group;
		return Account.findOrInvite(req.body.mail);
	}).then(function(account) {
		targetAccount = account;
		return AccountInGroup.find({
			where : {
				AccountId : targetAccount.id,
				GroupId : req.params.id
			}
		})
	}).then(function(accountInGroup) {
		if (accountInGroup) {
			throw ERROR_DUPLICATED;
		}
		return loadedGroup.addAccount(targetAccount);
	}).then(function(addedAccounts) {
		if (Account.STATUS_INVITING == targetAccount.status) {
			sendInvitationMail(loadedAccount, targetAccount);
		} else {
			sendInvitedToGroupMail(loadedAccount, targetAccount);
		}
		res.status(201).json(targetAccount);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else if (ERROR_DUPLICATED == error) {
			res.status(409).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
function sendInvitationMail(inviter, invited) {
	var dataForTemplate = {
		inviter : inviter,
		app : {
			name : serverConfig.app.name
		},
		activationURL : serverConfig.hostURL + "/invitation?key=" + invited.inviteKey.secret
	};
	console.log("---------send maill " + renderer.render('inviteMailTemplate.ect', dataForTemplate));
	return;
	sendmail({
		from : serverConfig.admin.mail,
		to : invited.mail,
		subject : 'Hi, youare invited to ' + serverConfig.app.name,
		content : renderer.render('inviteMailTemplate.ect', dataForTemplate)
	}, function(err, reply) {
		if (err) {
			errorFunc(error.stack, replay);
		}
	});
}
function sendInvitedToGroupMail(inviter, invited) {
}
module.exports = router;