var express = require('express');
var router = express.Router();
var AccessKey = global.db.AccessKey;
var AccountInGroup = global.db.AccountInGroup;
var Account = global.db.Account;
var Content = global.db.Content;
var Channel = global.db.Channel;
var Message = global.db.Message;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var env = process.env.NODE_ENV || "development";
var socket = global.socket;
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
var ERROR_DUPLICATED = "ERROR_DUPLICATED";
var Promise = require("bluebird");
var Random = require(__dirname + "/../../util/random");
var SendMail = require(__dirname + "/../../util/sendMail");
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
router.get('/:groupAccessKey/:channelAccessKey', function(req, res) {
	var sessionKey = req.query.sessionKey || req.query.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var loadedGroup;
	AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return Group.find({
			where : {
				accessKey : req.params.groupAccessKey
			},
			include : [ {
				model : Account
			} ]
		});
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedGroup = group;
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : loadedGroup.id
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		return loadedGroup.getChannels({
			where : {
				accessKey : req.params.channelAccessKey
			},
			include : [ {
				model : Account,
				as : "owner"
			} ]
		});
	}).then(function(channels) {
		if (!channels || !channels[0]) {
			throw ERROR_NOTFOUND
		}
		var channel = channels[0];
		channel.dataValues.Group = loadedGroup;
		channel.Group = loadedGroup;
		console.log("$$$$$$$$$$$$$$$$$ channel " + JSON.stringify(channel));
		res.status(200).json(channel);
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
router.post('/:accessKey/channels/:channelAccessKey/messages', function(req, res) {
	var sessionKey = req.body.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	if (!req.body.body) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var loadedChannel;
	AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return Channel.find({
			where : {
				accessKey : req.params.channelAccessKey
			},
			include : [ {
				model : Group
			} ]
		});
	}).then(function(channel) {
		if (!channel) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedChannel = channel;
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : loadedChannel.GroupId
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Random.createRandomBase62();
	}).then(function(random) {
		return Message.create({
			body : req.body.body,
			ownerId : loadedAccount.id,
			channelId : loadedChannel.id,
			accessKey : random,
			type : Message.TYPE_MARKDOWN
		});
	}).then(function(message) {
		message.dataValues.owner = loadedAccount;
		res.status(201).json(message);
		socket.sendToChannel(loadedChannel.accessKey, message);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.post('/:accessKey/channels', function(req, res) {
	var sessionKey = req.body.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	if (!req.body.name) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var loadedGroup;
	AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return Group.find({
			where : {
				accessKey : req.params.accessKey
			}
		});
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedGroup = group;
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : loadedGroup.id
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Random.createRandomBase62();
	}).then(function(random) {
		return Channel.create({
			ownerId : loadedAccount.id,
			GroupId : loadedGroup.id,
			accessKey : random,
			name : req.body.name
		});
	}).then(function(channel) {
		channel.dataValues.owner = loadedAccount;
		res.status(201).json(channel);
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
		return Random.createRandomBase62();
	}).then(function(random) {
		return Group.create({
			name : req.body.name,
			description : req.body.description,
			imageUrl : req.body.imageUrl,
			visibility : req.body.visibility,
			accessKey : random
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
	var loadedGroup;
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
		return Group.find({
			where : {
				accessKey : req.body.accessKey
			}
		});
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		loadedGroup = group;
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : loadedGroup.id
			}
		})
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedGroup.name = req.body.name;
		loadedGroup.description = req.body.description;
		loadedGroup.imageUrl = req.body.imageUrl;
		loadedGroup.visibility = req.body.visibility;
		return loadedGroup.save();
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
router.get('/:accessKey', function(req, res) {
	Group.find({
		where : {
			accessKey : req.params.accessKey
		},
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
				where : [ "\"Contents.ContentBodies\".\"version\" = \"Contents\".\"currentVersion\"" ],
				required : false,
				include : [ {
					model : Account,
					as : "updator",
					attributes : [ "name", "iconUrl" ]
				} ],
				order : "updatedAt"
			} ]
		}, {
			model : Channel
		} ],
		order : "\"createdAt\" DESC"
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
router.post('/:accessKey/invite', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var targetAccount;
	var loadedGroup;
	var createdAccountInGroup;
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return accessKey.getAccount();
	}).then(function(account) {
		loadedAccount = account;
		return Group.find({
			where : {
				accessKey : req.params.accessKey
			}
		});
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		loadedGroup = group;
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : loadedGroup.id
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization < Account.AUTHORIZATION_EDITOR) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findOrInvite(req.body.mail);
	}).then(function(account) {
		targetAccount = account;
		return AccountInGroup.find({
			where : {
				AccountId : targetAccount.id,
				GroupId : loadedGroup.id
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
		createdAccountInGroup = accountInGroup;
		if (Account.STATUS_INVITING == targetAccount.status) {
			var dataForTemplate = {
				inviter : loadedAccount,
				app : {
					name : serverConfig.app.name
				},
				group : loadedGroup,
				activationURL : serverConfig.hostURL + "/invitation?key=" + targetAccount.inviteKey.secret
			};
			return SendMail.send({
				from : serverConfig.admin.mail,
				to : targetAccount.mail,
				subject : 'Hi, you are invited to ' + serverConfig.app.name + " by " + loadedAccount.name,
				text : renderer.render('inviteMailTemplate.ect', dataForTemplate)
			});
		} else {
			var dataForTemplate = {
				inviter : loadedAccount,
				app : {
					name : serverConfig.app.name
				},
				group : loadedGroup
			};
			return SendMail.send({
				from : serverConfig.admin.mail,
				to : targetAccount.mail,
				subject : 'Hi, you are invited to ' + serverConfig.app.name + " by " + loadedAccount.name,
				text : renderer.render('inviteToGroupMailTemplate.ect', dataForTemplate)
			});
		}
	}).then(function() {
		res.status(201).json({
			id : targetAccount.id,
			mail : targetAccount.mail,
			AccountInGroup : createdAccountInGroup[0][0]
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
router.put('/:accessKey/join', function(req, res) {
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
		return Group.find({
			where : {
				accessKey : req.params.accessKey
			}
		});
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTACCESSIBLE;
		}
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : group.id
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
module.exports = router;