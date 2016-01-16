var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Group = global.db.Group;
var AccountInGroup = global.db.AccountInGroup;
var AccountInChannel = global.db.AccountInChannel;
var AccountConfig = global.db.AccountConfig;
var Channel = global.db.Channel;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Bot = global.db.Bot;
var NotificationTarget = global.db.NotificationTarget;
var express = require('express');
var router = express.Router();
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var renderer = require('ect')({
	root : './res/template'
});
var crypto = require('crypto');
var ImageTrimmer = require(__dirname + "/../../util/imageTrimmer");
var Storage = require(__dirname + "/../../util/storage");
var Random = require(__dirname + "/../../util/random");
var SendMail = require(__dirname + "/../../util/sendMail");
var ERROR_WRONG_ACCESS = "ERROR_WRONG_ACCESS";
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
var ERROR_DUPLICATE = "ERROR_DUPLICATE";
router.post('/', function(req, res) {
	if (null == req.body.name || req.body.name.length < 4 || null == req.body.mail || "" == req.body.mail || null == req.body.password || "" == req.body.password || !/^[a-zA-Z0-9]*$/.test(req.body.name)) {
		res.status(400).end();
		return;
	}
	var createdAccount;
	var savedActivationKey;
	var activationUrl;
	var ERROR_DUPLICATE_MAIL = "ERROR_DUPLICATE_MAIL";
	var ERROR_DUPLICATE_NAME = "ERROR_DUPLICATE_NAME";
	Account.find({
		where : global.db.sequelize.where(global.db.sequelize.fn('lower', global.db.sequelize.col('name')), req.body.name.toLowerCase())
	}).then(function(account) {
		if (account && Account.STATUS_INVITING != account.status) {
			throw ERROR_DUPLICATE_NAME;
		}
		return Account.find({
			where : {
				mail : req.body.mail
			}
		});
	}).then(function(account) {
		if (account && Account.STATUS_INVITING != account.status) {
			throw ERROR_DUPLICATE_MAIL;
		}
		var iconUrl = serverConfig.hostURL + "/images/icons." + (Date.now() % 3 + 1) + ".png"
		if (account) {
			account.name = req.body.name
			account.iconUrl = iconUrl
			account.status = Account.STATUS_REQUEST_ACTIVATION;
			return account.save();
		} else {
			return Account.create({
				name : req.body.name,
				mail : req.body.mail,
				iconUrl : iconUrl,
				language : req.headers["accept-language"],
				status : Account.STATUS_REQUEST_ACTIVATION
			})
		}
	}).then(function(account) {
		var passwordHashed = hash(req.body.password);
		createdAccount = account;
		return AccessKey.create({
			secret : passwordHashed,
			type : AccessKey.TYPE_LOGIN,
			status : AccessKey.STATUS_CREATED
		})
	}).then(function(loginAccessKey) {
		return loginAccessKey.setAccount(createdAccount);
	}).then(function() {
		return Random.createRandomBase62()
	}).then(function(secret) {
		return AccessKey.create({
			secret : secret,
			type : AccessKey.TYPE_ACTIVATION,
			status : AccessKey.STATUS_CREATED
		})
	}).then(function(accessKey) {
		savedActivationKey = accessKey;
		return accessKey.setAccount(createdAccount);
	}).then(function() {
		if (req.body.invitationKey) {
			return AccessKey.find({
				where : {
					secret : req.body.invitationKey,
					type : AccessKey.TYPE_INVITATION
				},
				include : [ {
					model : Account,
					required : true
				} ]
			}).then(function(invitationKey) {
				if (!invitationKey) {
					throw ERROR_NOTFOUND;
				}
				if (createdAccount.id != invitationKey.Account.id) {
					return Account.aggregate(createdAccount, invitationKey.Account).then(function() {
						return invitationKey.destroy();
					});
				}
				return new Promise(function(success) {
					success();
				});
			});
		} else {
			return new Promise(function(success) {
				success();
			})
		}
	}).then(function() {
		activationUrl = serverConfig.hostURL + "/activation?key=" + savedActivationKey.secret;
		var dataForTemplate = {
			app : {
				name : serverConfig.app.name
			},
			activationUrl : activationUrl
		};
		return SendMail.send({
			from : serverConfig.admin.mail,
			to : createdAccount.mail,
			subject : 'Welcome to ' + serverConfig.app.name,
			text : renderer.render('activationMailTemplate.ect', dataForTemplate)
		});
	}).then(function() {
		res.status(201).json({
			name : createdAccount.name,
			mail : createdAccount.mail,
			iconUrl : createdAccount.iconUrl,
			activationUrl : activationUrl
		});
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else if (ERROR_DUPLICATE_MAIL == error) {
			res.status(409).json({
				error : "mail"
			});
		} else if (ERROR_DUPLICATE_NAME == error) {
			res.status(409).json({
				error : "name"
			});
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
var hash = function(src) {
	if (!src) {
		return src;
	}
	var hashCommand = crypto.createHash('sha1');
	hashCommand.update(src)
	return hashCommand.digest('base64');
}
router.get('/nameNotDuplicate', function(req, res) {
	if (!req.query.name || "" == req.query.name) {
		res.status(400).end();
		return;
	}
	Account.find({
		attributes : [ "id" ],
		where : global.db.sequelize.where(global.db.sequelize.fn('lower', global.db.sequelize.col('name')), req.query.name.toLowerCase())
	}).then(function(account) {
		if (account) {
			res.status(409).end();
		} else {
			res.status(200).end();
		}
	});
});
router.get('/activation', function(req, res) {
	if (!req.query.key) {
		res.status(404).end();
		return;
	}
	AccessKey.find({
		where : {
			secret : req.query.key,
			type : AccessKey.TYPE_ACTIVATION
		}
	}).then(function(activationKey) {
		if (!activationKey) {
			throw ERROR_NOTFOUND;
		}
		activationKey.status = AccessKey.STATUS_DISABLED;
		activationKey.save();
		return activationKey.getAccount();
	}).then(function(account) {
		res.status(200).json(account);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else if (ERROR_DUPLICATE == error) {
			res.status(409).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	})
});
router.get('/invitation', function(req, res) {
	if (!req.query.key) {
		res.status(404).end();
		return;
	}
	AccessKey.find({
		where : {
			secret : req.query.key,
			type : AccessKey.TYPE_INVITATION
		}
	}).then(function(activationKey) {
		if (!activationKey) {
			throw ERROR_NOTFOUND;
		}
		return activationKey.getAccount({
			include : [ {
				model : Group
			} ]
		});
	}).then(function(account) {
		res.status(200).json(account);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else if (ERROR_DUPLICATE == error) {
			res.status(409).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	})
});
router.get('/', function(req, res) {
	if (!req.query.sessionKey) {
		res.status(400).end();
		return;
	}
	AccessKey.find({
		where : {
			secret : req.query.sessionKey,
			type : AccessKey.TYPE_SESSION
		}
	}).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.find({
			where : {
				id : accessKey.AccountId
			},
			include : [ {
				model : AccountConfig
			} ]
		});
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		account.dataValues.config = {};
		account.AccountConfigs.forEach(function(config) {
			account.dataValues.config[config.key] = config.value
		});
		delete account.dataValues.AccountConfigs;
		res.status(200).json(account);
	})["catch"](function(error) {
		if (error == ERROR_NOTACCESSIBLE) {
			res.status(400).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.get('/signin', function(req, res) {
	if (null == req.query.mail || "" == req.query.mail || null == req.query.password || "" == req.query.password) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var createdAccessKey;
	Account.find({
		where : {
			mail : req.query.mail
		},
		include : [ {
			model : AccountConfig
		} ]
	}).then(function(account) {
		if (!account) {
			throw ERROR_WRONG_ACCESS;
			return;
		}
		loadedAccount = account;
		return AccessKey.find({
			where : {
				AccountId : account.id,
				secret : hash(req.query.password),
				type : AccessKey.TYPE_LOGIN
			}
		})
	}).then(function(loginAccessKey) {
		if (!loginAccessKey) {
			throw ERROR_WRONG_ACCESS;
			return;
		}
		return Random.createRandomBase62();
	}).then(function(sessionKey) {
		return AccessKey.create({
			AccountId : loadedAccount.id,
			secret : sessionKey,
			type : AccessKey.TYPE_SESSION,
			status : AccessKey.STATUS_CREATED
		})
	}).then(function(accessKey) {
		createdAccessKey = accessKey;
		if (req.query.invitationKey) {
			return AccessKey.find({
				where : {
					secret : req.query.invitationKey,
					type : AccessKey.TYPE_INVITATION
				},
				include : [ {
					model : Account,
					required : true
				} ]
			}).then(function(invitationKey) {
				if (!invitationKey) {
					throw ERROR_NOTFOUND;
				}
				if (loadedAccount.id != invitationKey.Account.id) {
					return Account.aggregate(loadedAccount, invitationKey.Account).then(function() {
						return invitationKey.destroy();
					});
				}
				return new Promise(function(success) {
					success();
				});
			});
		} else {
			return new Promise(function(success) {
				success();
			});
		}
	}).then(function() {
		loadedAccount.dataValues.config = {};
		loadedAccount.AccountConfigs.forEach(function(config) {
			loadedAccount.dataValues.config[config.key] = config.value
		});
		delete loadedAccount.dataValues.AccountConfigs;
		res.status(200).json({
			sessionKey : createdAccessKey,
			account : loadedAccount
		});
	})["catch"](function(error) {
		if (ERROR_WRONG_ACCESS == error) {
			res.status(400).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	})
});
router.post('/sendResetpasswordMail', function(req, res) {
	if (null == req.body.mail || "" == req.body.mail) {
		res.status(400).end();
		return;
	}
	var createdAccount;
	var createdRandom;
	Account.find({
		where : {
			mail : req.body.mail
		}
	}).then(function(account) {
		if (!account) {
			throw ERROR_WRONG_ACCESS;
		}
		createdAccount = account
		return Random.createRandomBase62();
	}).then(function(random) {
		createdRandom = random;
		return AccessKey.create({
			AccountId : createdAccount.id,
			secret : random,
			type : AccessKey.TYPE_RESETMAIL,
			status : AccessKey.STATUS_CREATED
		})
	}).then(function(activationKey) {
		if (!activationKey) {
			throw ERROR_NOTFOUND;
		}
		var dataForTemplate = {
			account : createdAccount,
			resetPassswordURL : serverConfig.hostURL + "/resetPassword?key=" + createdRandom
		};
		return SendMail.send({
			from : serverConfig.admin.mail,
			to : req.body.mail,
			subject : 'Welcome to ' + serverConfig.app.name,
			body : renderer.render('resetPasswordMailTemplate.ect', dataForTemplate)
		});
	}).then(function(activationKey) {
		res.status(200).json(activationKey);
	})["catch"](function(error) {
		if (ERROR_WRONG_ACCESS == error) {
			res.status(400).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	})
});
router.put('/', function(req, res) {
	if (!req.body.key) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(req.body.key).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.find({
			where : {
				id : accessKey.AccountId
			}
		});
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		var saveAccount = function(iconUrl) {
			if (req.body.name) {
				account.name = req.body.name;
			}
			if (req.body.information) {
				account.information = req.body.information;
			}
			if (iconUrl) {
				account.iconUrl = iconUrl;
			}
			account.save().then(function() {
				res.status(200).send(account);
			});
		}
		if (req.files.imageFile && req.files.imageFile[0]) {
			return Random.createRandomBase62().then(function(imageFileKey) {
				return Storage.store(imageFileKey, req.files.imageFile[0].mimetype, null, req.files.imageFile[0]);
			}).then(function(url) {
				saveAccount(url);
			});
		} else {
			saveAccount();
		}
	})["catch"](function(error) {
		if (error === ERROR_NOTACCESSIBLE) {
			res.status(400).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
			throw error;
		}
	});
});
router.put('/password', function(req, res) {
	if (null == req.body.password || "" == req.body.password || null == req.body.key || "" == req.body.key) {
		res.status(400).end();
		return;
	}
	var accountId;
	AccessKey.find({
		where : {
			secret : req.body.key,
			status : AccessKey.STATUS_CREATED
		}
	}).then(function(accessKey) {
		if (!accessKey || (!AccessKey.TYPE_RESETMAIL == accessKey.type && !AccessKey.TYPE_SESSION == accessKey.type)) {
			res.status(400).end();
			throw "accessKey not found";
		}
		accountId = accessKey.AccountId;
		if (AccessKey.TYPE_RESETMAIL == accessKey.type) {
			return accessKey.destroy();
		} else {
			return;
		}
	}).then(function() {
		return Account.find({
			where : {
				id : accountId
			}
		})
	}).then(function(account) {
		if (!account) {
			res.status(400).end();
			throw "account not found";
		}
		return AccessKey.destroy({
			where : {
				type : AccessKey.TYPE_LOGIN
			}
		});
	}).then(function() {
		var passwordHashed = hash(req.body.password);
		return AccessKey.create({
			AccountId : accountId,
			secret : passwordHashed,
			type : AccessKey.TYPE_LOGIN,
			status : AccessKey.STATUS_CREATED
		});
	}).then(function(accessKey) {
		res.status(200).end();
	})["catch"](function(error) {
		console.trace(error);
		res.status(500).end();
	});
});
router["delete"]('/accessKey', function(req, res) {
	if (!req.query.key) {
		res.status(400).end();
		return;
	}
	AccessKey.destroy({
		where : {
			secret : req.query.key
		}
	}).then(function(count) {
		res.status(200).end();
	});
});
router.post("/keys", function(req, res) {
	if (!req.body.sessionKey) {
		res.status(400).end();
		return;
	}
	var loadedAccessKey;
	AccessKey.findBySessionKey(req.body.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccessKey = accessKey;
		return Random.createRandomBase62();
	}).then(function(random) {
		return AccessKey.create({
			AccountId : loadedAccessKey.AccountId,
			secret : random,
			type : AccessKey.TYPE_GENERATE_SESSION
		});
	}).then(function(accessKey) {
		res.status(200).json(accessKey);
	})["catch"](function(error) {
		console.log(error.stack);
		res.status(500).end();
	});
});
router.get("/keys", function(req, res) {
	if (!req.query.sessionKey) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(req.query.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return AccessKey.findAll({
			where : {
				AccountId : accessKey.AccountId,
				type : {
					$or : [ {
						$eq : AccessKey.TYPE_SESSION
					}, {
						$eq : AccessKey.TYPE_GENERATE_SESSION
					} ]
				}
			},
			order : [ [ "createdAt", "DESC" ] ]
		});
	}).then(function(accessKeys) {
		res.status(200).json(accessKeys);
	})["catch"](function(error) {
		console.log(error.stack);
		res.status(500).end();
	});
});
router.get("/channels/accessible", function(req, res) {
	if (!req.query.sessionKey) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var loadedPrivateChannels;
	AccessKey.findBySessionKey(req.query.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccount = account;
		return account.getChannels({
			include : [ {
				model : Bot,
				attribute : [ "id", "name", "iconUrl" ]
			} ]
		});
	}).then(function(privateChannels) {
		loadedPrivateChannels = privateChannels;
		return loadedAccount.getGroups();
	}).then(function(groups) {
		if (!groups) {
			res.status(200).json(loadedPrivateChannels.filter(function(channel) {
				return AccountInChannel.TYPE_JOIN == channel.AccountInChannel.type;
			}));
		} else {
			var groupIds = groups.map(function(group) {
				return group.id
			});
			var notInChannelIds = loadedPrivateChannels.filter(function(channel) {
				return AccountInChannel.TYPE_REAVE == channel.AccountInChannel.type;
			}).map(function(accountInChannel) {
				return accountInChannel.Channel.id;
			})
			var where = {
				$and : {
					GroupId : {
						$in : groupIds
					}
				}
			}
			if (0 < notInChannelIds.length) {
				where.$and.id = {
					$notIn : notInChannelIds
				}
			}
			Channel.findAll({
				where : where,
				include : [ {
					model : Group,
					include : [ {
						model : Account
					} ]
				}, {
					model : Bot,
					attribute : [ "id", "name", "iconUrl" ]
				} ]
			}).then(function(channels) {
				var privateChannels = loadedPrivateChannels.filter(function(channel) {
					return AccountInChannel.TYPE_JOIN == channel.AccountInChannel.type;
				});
				res.status(200).json(channels.concat(privateChannels));
			});
		}
	})["catch"](function(error) {
		console.log(error.stack);
		res.status(500).end();
	});
});
router["delete"]("/keys", function(req, res) {
	if (!req.query.sessionKey || !req.query.secret) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(req.query.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return AccessKey.find({
			where : {
				AccountId : accessKey.AccountId,
				secret : req.query.secret
			}
		});
	}).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTFOUND;
		}
		accessKey.destroy();
	}).then(function() {
		res.status(200).end();
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			res.status(500).end();
			console.log(error.stack);
		}
	});
});
router.get("/:id", function(req, res) {
	var loadedAccount;
	Account.find({
		where : {
			id : req.params.id
		},
		attributes : [ "id", "name", "iconUrl", "information" ],
		include : [ {
			model : Content,
			include : [ {
				model : ContentBody,
				where : [ "\"ContentBodies\".\"version\" = \"Content\".\"currentVersion\" and \"ContentBodies\".\"status\" = " + ContentBody.STATUS_OPEN ]
			} ],
			limit : 5
		} ]
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTFOUND;
		}
		loadedAccount = account;
		return account.getGroups({
			where : {
				visibility : Group.VISIBILITY_OPEN
			}
		})
	}).then(function(groups) {
		loadedAccount.dataValues.Groups = groups;
		res.status(200).json(loadedAccount);
	})["catch"](function(error) {
		if (ERROR_NOTFOUND == error) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	})
});
router["delete"]('/devices', function(req, res) {
	if (!req.query.sessionKey || !req.query.key) {
		res.status(400).end();
		return;
	}
	var loadedAccessKey;
	AccessKey.findBySessionKey(req.query.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccessKey = accessKey;
		return NotificationTarget.find({
			where : {
				key : req.query.key
			}
		});
	}).then(function(notificationTarget) {
		if (notificationTarget) {
			notificationTarget.destroy();
			res.status(200).end();
		} else {
			res.status(404).end();
		}
	})["catch"](function(error) {
		console.log(error.stack);
		res.status(500).end();
	});
});
router.post("/devices", function(req, res) {
	if (!(req.body.sessionKey && req.body.platform && req.body.endpoint)) {
		res.status(400).json({
			sessionKey : req.body.sessionKey,
			platform : req.body.platform,
			deviceId : req.body.endpoint
		});
		return;
	}
	var DUPLICATE_ERROR = "DUPLICATE_ERROR";
	var loadedAccessKey;
	AccessKey.findBySessionKey(req.body.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		loadedAccessKey = accessKey;
		return NotificationTarget.find({
			where : {
				ownerId : accessKey.AccountId,
				endpoint : req.body.endpoint
			}
		});
	}).then(function(notificationTarget) {
		if (notificationTarget) {
			notificationTarget.destroy();
		}
		return Random.createRandomBase62();
	}).then(function(random) {
		return NotificationTarget.create({
			status : NotificationTarget.STATUS_CREATED,
			endpoint : req.body.endpoint,
			key : random,
			platformParameter : req.body.platformParameter,
			platform : req.body.platform,
			ownerId : loadedAccessKey.AccountId
		});
	}).then(function(notificationTarget) {
		res.status(201).json(notificationTarget);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else if (DUPLICATE_ERROR == error) {
			res.status(409).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.put("/config", function(req, res) {
	if (!(req.body.sessionKey && req.body.key && req.body.value)) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(req.body.sessionKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Account.findById(accessKey.AccountId);
	}).then(function(account) {
		if (!account) {
			throw ERROR_NOTACCESSIBLE;
		}
		return account.setConfig(req.body.key, req.body.value, req.body.description);
	}).then(function() {
		res.status(200).end();
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
module.exports = router;