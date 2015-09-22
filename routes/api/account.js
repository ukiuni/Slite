var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var express = require('express');
var router = express.Router();
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var renderer = require('ect')({
	root : './res/template'
});
var sendmail = require('sendmail')();
var crypto = require('crypto');
var ImageTrimmer = require(__dirname + "/../../util/imageTrimmer");
var Storage = require(__dirname + "/../../util/storage");
var Random = require(__dirname + "/../../util/random");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
var ERROR_DUPLICATE = "ERROR_DUPLICATE";
router.post('/', function(req, res) {
	if (null == req.body.name || "" == req.body.name || null == req.body.mail || "" == req.body.mail || null == req.body.password || "" == req.body.password) {
		res.status(400).end();
		return;
	}
	var createdAccount;
	Account.find({
		where : {
			mail : req.body.mail
		}
	}).then(function(account) {
		if (account && Account.STATUS_INVITING != account.status) {
			throw ERROR_DUPLICATE;
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
		accessKey.setAccount(createdAccount).then(function() {
			sendActivationMail(createdAccount.mail, accessKey.secret, function() {
				res.status(424).end();
			});
			res.status(201).end();
		})["catch"](function(error) {
			console.trace(error);
			res.status(500).json(error);
		});
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
	});
});
var sendActivationMail = function(toMailAddress, activationKey, errorFunc) {
	var dataForTemplate = {
		app : {
			name : serverConfig.app.name
		},
		activationURL : serverConfig.hostURL + "/activation?key=" + activationKey
	};
	console.log("---------send maill " + renderer.render('activationMailTemplate.ect', dataForTemplate));
	return;
	sendmail({
		from : serverConfig.admin.mail,
		to : toMailAddress,
		subject : 'Welcome to ' + serverConfig.app.name,
		content : renderer.render('activationMailTemplate.ect', dataForTemplate)
	}, function(err, reply) {
		if (err) {
			errorFunc(error.stack, replay);
		}
	});
}
var hash = function(src) {
	if (!src) {
		return src;
	}
	var hashCommand = crypto.createHash('sha1');
	hashCommand.update(src)
	return hashCommand.digest('base64');
}
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
		activationKey.status = AccessKey.STATUS_DISABLED;
		activationKey.save();
		activationKey.getAccount().then(function(account) {
			res.status(200).json(account);
		})["catch"](function(error) {
			console.trace(error);
			res.status(500).end();
		})
	})["catch"](function(error) {
		console.trace(error);
		res.status(500).end();
	})
});
router.get('/', function(req, res) {
	if (req.query.sessionKey) {
		AccessKey.find({
			where : {
				secret : req.query.sessionKey,
				type : AccessKey.TYPE_SESSION
			}
		}).then(function(accessKey) {
			if (!accessKey) {
				res.status(400).end();
				throw ERROR_NOTACCESSIBLE;
			}
			return Account.find({
				where : {
					id : accessKey.AccountId
				}
			});
		}).then(function(account) {
			if (!account) {
				res.status(400).end();
				return;
			}
			res.status(200).json(account);
		})["catch"](function(error) {
			if (error == ERROR_NOTACCESSIBLE) {
				res.status(400).end();
			} else {
				res.status(500).end();
			}
		});
		return;
	} else {
		res.status(400).end();
	}
});
router.get('/signin', function(req, res) {
	if (null == req.query.mail || "" == req.query.mail || null == req.query.password || "" == req.query.password) {
		res.status(400).end();
		return;
	}
	Account.find({
		where : {
			mail : req.query.mail
		}
	}).then(function(account) {
		if (!account) {
			res.status(400).end();
			return;
		}
		AccessKey.find({
			where : {
				AccountId : account.id,
				secret : hash(req.query.password),
				type : AccessKey.TYPE_LOGIN
			}
		}).then(function(activationKey) {
			if (!activationKey) {
				res.status(400).end();
			} else {
				Random.createRandomBase62().then(function(sessionKey) {
					return AccessKey.create({
						AccountId : account.id,
						secret : sessionKey,
						type : AccessKey.TYPE_SESSION,
						status : AccessKey.STATUS_CREATED
					}).then(function(accessKey) {
						res.status(200).json({
							sessionKey : accessKey,
							account : account
						});
					});
				});
			}
		})["catch"](function(error) {
			console.trace(error);
			res.status(500).end();
		});
	})["catch"](function(error) {
		console.trace(error);
		res.status(500).end();
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
			res.status(400).end();
			return;
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
			res.status(400).end();
		} else {
			res.status(200).json(activationKey);
			sendResetPasswordMail(createdAccount, createdRandom);
		}
	})["catch"](function(error) {
		console.trace(error);
		res.status(500).end();
	})
});
router.put('/', function(req, res) {
	if (!req.body.key) {
		res.status(400).end();
		return;
	}
	AccessKey.find({
		where : {
			secret : req.body.key,
			status : AccessKey.STATUS_CREATED,
			type : AccessKey.TYPE_SESSION
		}
	}).then(function(accessKey) {
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
			})["catch"](function() {
				res.status(500).end();
			});
		}
		if (req.files.imageFile && req.files.imageFile[0] && req.files.imageFile[0].buffer) {
			ImageTrimmer.trim(req.files.imageFile[0].buffer, 100, 100).then(function() {
				return Random.createRandomBase62();
			}).then(function(imageFileKey) {
				return Storage.store(imageFileKey, req.files.imageFile[0].mimetype, req.files.imageFile[0].buffer).then(function(url) {
					saveAccount(url);
				})
			})["catch"](function(error) {
				res.status(500).end();
			})
		} else {
			saveAccount();
		}
	})["catch"](function(error) {
		if (error === ERROR_NOTACCESSIBLE) {
			res.status(400).end();
		} else {
			console.trace(error);
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
var sendResetPasswordMail = function(account, resetKey, errorFunc) {
	var dataForTemplate = {
		account : account,
		resetPassswordURL : serverConfig.hostURL + "/resetPassword?key=" + resetKey
	};
	console.log("---------send maill " + renderer.render('resetPasswordMailTemplate.ect', dataForTemplate));
	return;
	sendmail({
		from : serverConfig.admin.mail,
		to : toMailAddress,
		subject : 'Welcome to ' + serverConfig.app.name,
		content : renderer.render('resetPasswordMailTemplate.ect', dataForTemplate)
	}, function(err, reply) {
		if (err) {
			errorFunc(error.stack, replay);
		}
	});
}
module.exports = router;