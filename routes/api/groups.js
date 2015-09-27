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
		} ],
		order : "createdAt DESC"
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		if (group.visibility == Group.VISIBILITY_OPEN) {
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
			for ( var i in group.Accounts) {
				if (group.Accounts[i].id == loadedAccessKey.AccountId) {
					if (Group.VISIBILITY_SECRET_EVEN_MEMBER == group.visibility && Account.AUTHORIZATION_ADMIN != group.Accounts[i].AccountInGroup.authorization) {
						delete group.Accounts
					}
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
		return loadedGroup.addAccount(targetAccount, {
			authorization : req.body.authorization,
			inviting : Group.INVITING_START
		});
	}).then(function(accountInGroup) {
		if (Account.STATUS_INVITING == targetAccount.status) {
			sendInvitationMail(loadedAccount, targetAccount);
		} else {
			sendInvitedToGroupMail(loadedAccount, targetAccount);
		}
		res.status(201).json({
			id : targetAccount.id,
			mail : targetAccount.mail,
			AccountInGroup : accountInGroup[0][0]
		});
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
router.put('/:id/join', function(req, res) {
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
		if (!accountInGroup || accountInGroup.inviting != Group.INVITING_START) {
			throw ERROR_NOTACCESSIBLE;
		}
		accountInGroup.inviting = Group.INVITING_DONE;
		return accountInGroup.save();
	}).then(function(accountInGroup) {
		res.status(200).json(accountInGroup);
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