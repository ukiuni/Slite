var express = require('express');
var router = express.Router();
var AccessKey = global.db.AccessKey;
var AccountInGroup = global.db.AccountInGroup;
var Account = global.db.Account;
var Content = global.db.Content;
var Channel = global.db.Channel;
var Message = global.db.Message;
var TimerTask = global.db.TimerTask;
var NotificationTarget = global.db.NotificationTarget;
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
	var loadedAccount;
	var loadedGroup;
	Group.find({
		where : {
			accessKey : req.params.groupAccessKey
		},
		include : [ {
			model : Account,
			attributes : [ "id", "name", "iconUrl" ],
			where : global.db.sequelize.where(global.db.sequelize.col("Accounts.AccountInGroup.inviting"), Group.INVITING_DONE)
		} ]
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		loadedGroup = group;
		var sessionKey = req.query.sessionKey || req.query.access_token;
		if (!sessionKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return AccessKey.findBySessionKey(sessionKey)
	}).then(function(accessKey) {
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
				AccountId : loadedAccount.id,
				GroupId : loadedGroup.id,
				inviting : Group.INVITING_DONE
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup) {
			throw ERROR_NOTACCESSIBLE;
		}
		return loadedGroup.getChannels({
			where : {
				accessKey : req.params.channelAccessKey
			},
			include : [ {
				model : Account,
				as : "owner",
				attributes : [ "id", "name", "iconUrl" ]
			} ]
		});
	}).then(function(channels) {
		if (!channels || !channels[0]) {
			throw ERROR_NOTFOUND;
		}
		var channel = channels[0];
		channel.dataValues.Group = loadedGroup;
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
	var channelAccessKey = req.params.channelAccessKey;
	var loadedAccount;
	var loadedChannel;
	Channel.resolveChannel(sessionKey, channelAccessKey).then(function(resolved) {
		loadedAccount = resolved.loadedAccount;
		loadedChannel = resolved.loadedChannel;
		return Random.createRandomBase62();
	}).then(function(random) {
		var matchToRemind;
		if ((matchToRemind = req.body.body.match(/^\/remind[\p{blank}\s]+([0-2]?[0-4]):([0-5]?[0-9])[\p{blank}\s]+(.+)$/))) {
			var hour = matchToRemind[1];
			var minutes = matchToRemind[2];
			var message = matchToRemind[3];
			var targetDate = new Date();
			targetDate.setHours(parseInt(hour));
			targetDate.setMinutes(parseInt(minutes));
			if (targetDate < new Date()) {
				var time = targetDate.getTime() + 24 * 60 * 60 * 1000;
				targetDate = new Date(time);
			}
			return TimerTask.create({
				targetDate : targetDate,
				config : JSON.stringify({
					ownerId : loadedAccount.id,
					channelId : loadedChannel.id,
					message : message
				}),
				type : TimerTask.TYPE_REMIND,
				repeatType : TimerTask.REPEAT_TYPE_NONE
			}).then(function(timerTask) {
				res.status(201).json(timerTask);
				socket.sendRemindAppendedEventToAccount(loadedAccount.id, targetDate.getTime(), message);
			})
		} else {
			return Message.create({
				body : req.body.body,
				ownerId : loadedAccount.id,
				channelId : loadedChannel.id,
				accessKey : random,
				type : Message.TYPE_MARKDOWN
			}).then(function(message) {
				message.dataValues.owner = loadedAccount;
				message.owner = loadedAccount;
				res.status(201).json(message);
				socket.sendToChannel(loadedChannel.accessKey, message);
				NotificationTarget.notifyToChannel(loadedChannel, message);
			});
		}
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.get('/:accessKey/channels/:channelAccessKey/messages/query', function(req, res) {
	var sessionKey = req.query.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	var channelAccessKey = req.params.channelAccessKey;
	var loadedAccount;
	var loadedChannel;
	Channel.resolveChannel(sessionKey, channelAccessKey).then(function(resolved) {
		loadedAccount = resolved.loadedAccount;
		loadedChannel = resolved.loadedChannel;
		return Message.findAll({
			where : {
				body : {
					$like : '%' + req.query.searchWord + '%'
				},
				channelId : loadedChannel.id
			},
			include : [ {
				model : Account,
				as : "owner",
				attributes : [ "id", "name", "iconUrl" ]
			} ]
		});
	}).then(function(messages) {
		res.status(201).json(messages);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.get('/:accessKey/channels/:channelAccessKey/messages/queryTimeline', function(req, res) {
	var sessionKey = req.query.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	var startDate = new Date();
	startDate.setTime(req.query.startTime);
	var endDate = new Date();
	endDate.setTime(req.query.endTime);
	if (!startDate || !endDate) {
		res.status(400).end();
		return;
	}
	var channelAccessKey = req.params.channelAccessKey;
	var loadedAccount;
	var loadedChannel;
	Channel.resolveChannel(sessionKey, channelAccessKey).then(function(resolved) {
		loadedAccount = resolved.loadedAccount;
		loadedChannel = resolved.loadedChannel;
		return Message.findAll({
			where : {
				createdAt : {
					$lt : endDate,
					$gt : startDate
				},
				channelId : loadedChannel.id
			},
			include : [ {
				model : Account,
				as : "owner",
				attributes : [ "id", "name", "iconUrl" ]
			} ]
		});
	}).then(function(messages) {
		res.status(201).json(messages);
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
				GroupId : loadedGroup.id,
				inviting : Group.INVITING_DONE
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
		} else if (error.name && "SequelizeUniqueConstraintError" == error.name) {
			res.status(409).end();
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
		return accessKey.getAccount();
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
				GroupId : loadedGroup.id,
				inviting : Group.INVITING_DONE
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
		} else if (error.name && "SequelizeUniqueConstraintError" == error.name) {
			res.status(409).end();
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
		var accessKey = req.query.sessionKey || req.query.access_token;
		if (group.visibility == Group.VISIBILITY_OPEN && !accessKey) {
			group.dataValues.Accounts = group.Accounts.filter(function(account) {
				return Group.INVITING_DONE == account.AccountInGroup.inviting
			})
			res.status(200).json(group);
			return;
		}
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		var loadedAccessKey;
		AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedAccessKey = accessKey;
			var isMember = false;
			for ( var i in group.Accounts) {
				if (group.Accounts[i].id == loadedAccessKey.AccountId) {
					if (Group.INVITING_DONE == group.Accounts[i].AccountInGroup.inviting || Group.INVITING_START == group.Accounts[i].AccountInGroup.inviting) {
						if (Account.AUTHORIZATION_ADMIN == group.Accounts[i].AccountInGroup.authorization) {
							res.status(200).json(group);
							return;
						}
					}
					isMember = true;
				}
			}
			if (isMember && Group.INVITING_REQUESTED == group.Accounts[i].AccountInGroup.inviting && (Group.VISIBILITY_OPEN != group.visibility)) {
				throw ERROR_NOTACCESSIBLE;
			}
			if (!isMember && (Group.VISIBILITY_OPEN != group.visibility)) {
				throw ERROR_NOTACCESSIBLE;
			}
			if (Group.VISIBILITY_SECRET_EVEN_MEMBER == group.visibility) {
				group.dataValues.Accounts = group.Accounts.filter(function(account) {
					return account.id == loadedAccessKey.AccountId;
				})
			} else {
				group.dataValues.Accounts = group.Accounts.filter(function(account) {
					return account.id == loadedAccessKey.AccountId || Group.INVITING_DONE == account.AccountInGroup.inviting
				});
			}
			res.status(200).json(group);
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
	if (!accessKey || !req.body.authorization || !req.body.mail) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var targetAccount;
	var loadedGroup;
	var createdAccountInGroup;
	var fromInvitationRequest = false;
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
				GroupId : loadedGroup.id,
				inviting : Group.INVITING_DONE
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup || accountInGroup.authorization != Account.AUTHORIZATION_ADMIN) {
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
			if (Group.INVITING_REQUESTED != accountInGroup.inviting) {
				throw ERROR_DUPLICATED;
			}
			fromInvitationRequest = true;
			accountInGroup.inviting = Group.INVITING_START;
			accountInGroup.authorization = req.body.authorization;
			return accountInGroup.save();
		}
		return loadedGroup.addAccount(targetAccount, {
			authorization : req.body.authorization,
			inviting : Group.INVITING_START,
			invitor : loadedAccount
		});
	}).then(function() {
		return AccountInGroup.find({
			where : {
				AccountId : targetAccount.id,
				GroupId : loadedGroup.id
			}
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
			AccountInGroup : createdAccountInGroup
		});
		targetAccount.dataValues.AccountInGroup = createdAccountInGroup;
		socket.sendInvitationEvent(loadedGroup, targetAccount);
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
router.post('/:accessKey/invitaionRequest', function(req, res) {
	if (!req.body.mail) {
		res.status(400).end();
		return;
	}
	var PRECONDITION_FAILED = "PRECONDITION_FAILED";
	var loadedAccount;
	var loadedGroup;
	var createdAccountInGroup;
	Account.findOrInvite(req.body.mail).then(function(account) {
		loadedAccount = account;
		if (!loadedAccount.inviteKey) {
			var accessKey = req.body.sessionKey || req.body.access_token;
			if (!accessKey) {
				throw PRECONDITION_FAILED;
			}
			return AccessKey.findBySessionKey(accessKey);
		} else {
			return new Promise(function(success) {
				success({
					AccountId : loadedAccount.id
				})
			})
		}
	}).then(function(accountAccessKey) {
		if (accountAccessKey.AccountId != loadedAccount.id) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Group.find({
			where : {
				accessKey : req.params.accessKey
			}
		})
	}).then(function(group) {
		if (!group) {
			throw ERROR_NOTFOUND;
		}
		loadedGroup = group;
		loadedGroup.getAccounts({
			where : {
				id : loadedAccount.id
			}
		})
	}).then(function(accountInGroup) {
		if (accountInGroup) {
			throw ERROR_DUPLICATED;
		}
		return loadedGroup.addAccount(loadedAccount, {
			inviting : Group.INVITING_REQUESTED,
			invitor : loadedAccount
		});
	}).then(function(accountInGroup) {
		createdAccountInGroup = accountInGroup;
		return loadedGroup.getAccounts({
			where : [ "\"AccountInGroup\".\"authorization\" = " + Account.AUTHORIZATION_ADMIN + " and \"AccountInGroup\".\"inviting\" = " + Group.INVITING_DONE ]
		});
	}).then(function(accounts) {
		var dummyPromise = new Promise(function(success) {
			success()
		});
		accounts.forEach(function(account) {
			var dataForTemplate = {
				from : loadedAccount,
				app : {
					name : serverConfig.app.name
				},
				group : {
					name : loadedGroup.name,
					url : serverConfig.hostURL + "/group/" + loadedGroup.accessKey
				}
			}
			dummyPromise = dummyPromise.then(function() {
				loadedAccount.dataValues.AccountInGroup = createdAccountInGroup[0][0];
				socket.sendInvitationRequestEventToAccount(account, loadedGroup, loadedAccount);
				return SendMail.send({
					from : serverConfig.admin.mail,
					to : account.mail,
					subject : 'Invitement request from ' + loadedAccount.mail + " to " + loadedGroup.name,
					text : renderer.render('invitementRequestMailTemplate.ect', dataForTemplate)
				});
			});
		});
		return dummyPromise;
	}).then(function() {
		res.status(201).json({
			id : loadedAccount.id,
			mail : loadedAccount.mail,
			AccountInGroup : createdAccountInGroup[0][0]
		});
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else if (ERROR_DUPLICATED == error) {
			res.status(409).end();
		} else if (PRECONDITION_FAILED == error) {
			res.status(412).end();
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
	var loadedGroup;
	var updatedAccountInGroup;
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
		loadedGroup = group
		return AccountInGroup.find({
			where : {
				AccountId : loadedAccount.id,
				GroupId : group.id,
				inviting : Group.INVITING_START
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup) {
			throw ERROR_NOTACCESSIBLE;
		}
		accountInGroup.inviting = Group.INVITING_DONE;
		return accountInGroup.save();
	}).then(function(accountInGroup) {
		res.status(200).json(accountInGroup);
		updatedAccountInGroup = accountInGroup;
		return loadedGroup.getAccounts({
			where : [ "\"AccountInGroup\".\"authorization\" = " + Account.AUTHORIZATION_ADMIN + " and \"AccountInGroup\".\"inviting\" = " + Group.INVITING_DONE ]
		});
	}).then(function(accounts) {
		loadedAccount.dataValues.AccountInGroup = updatedAccountInGroup;
		accounts.forEach(function(account) {
			socket.sendJoinEventToAdmin(account, loadedGroup, loadedAccount);
		})
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
var loadTargetAccountIngroupAsAdmin = function(accessKey, groupAccessKey, targetAccountId) {
	var loadedAccount;
	var targetAccount;
	var loadedGroup;
	return AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return accessKey.getAccount();
	}).then(function(account) {
		loadedAccount = account;
		return Group.find({
			where : {
				accessKey : groupAccessKey
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
				GroupId : group.id,
				authorization : Account.AUTHORIZATION_ADMIN
			}
		});
	}).then(function(accountInGroup) {
		if (!accountInGroup) {
			throw ERROR_NOTACCESSIBLE;
		}
		return AccountInGroup.find({
			where : {
				AccountId : targetAccountId,
				GroupId : loadedGroup.id,
			}
		});
	})
}
router.put('/:accessKey/authorization', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey || !req.body.targetId || !req.body.authorization) {
		res.status(400).end();
		return;
	}
	loadTargetAccountIngroupAsAdmin(accessKey, req.params.accessKey, req.body.targetId).then(function(accountInGroup) {
		accountInGroup.authorization = req.body.authorization;
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
router.put('/:accessKey/strike', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.access_token;
	if (!accessKey || !req.body.targetId) {
		res.status(400).end();
		return;
	}
	loadTargetAccountIngroupAsAdmin(accessKey, req.params.accessKey, req.body.targetId).then(function(accountInGroup) {
		return accountInGroup.destroy();
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