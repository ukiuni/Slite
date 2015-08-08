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
router.post('/', function(req, res) {
	if (null == req.body.name || "" == req.body.name || null == req.body.mail || "" == req.body.mail || null == req.body.password || "" == req.body.password) {
		res.status(400).send();
		return;
	}
	Account.find({
		where : [ 'mail = ?', req.body.mail ]
	}).then(function(account) {
		if (account) {
			res.status(409).send();
			return;
		}
		createRandomBase62(function(accountKey) {
			Account.create({
				name : req.body.name,
				mail : req.body.mail,
				accountKey : accountKey
			}).then(function(account) {
				var passwordHashed = hash(req.body.password);
				AccessKey.create({
					secret : passwordHashed,
					type : AccessKey.TYPE_LOGIN,
					status : AccessKey.STATUS_CREATED
				}).then(function(loginAccessKey) {
					return loginAccessKey.setAccount(account);
				}).then(function() {
					createRandomBase62(function(secret) {
						AccessKey.create({
							secret : secret,
							type : AccessKey.TYPE_ACTIVATION,
							status : AccessKey.STATUS_CREATED
						}).then(function(accessKey) {
							accessKey.setAccount(account).then(function() {
								sendActivationMail(account.mail, accessKey.secret, function() {
									res.status(424).send();
								});
								res.status(201).send();
							})["catch"](function(error) {
								console.log("error = " + error);
								res.status(500).json(error);
							});
						})["catch"](function(error) {
							console.log("error = " + error);
							res.status(500).json(error);
						});
					})
				})["catch"](function(error) {
					console.log("error = " + error);
					res.status(500).json(error);
				});
			})["catch"](function(error) {
				console.log("error = " + error);
				res.status(500).json(error);
			});
		});
	})["catch"](function(error) {
		console.log("error = " + error);
		res.status(500).json(error);
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
			console.log(error);
			res.status(500).end();
		})
	})["catch"](function(error) {
		console.log(error);
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
				res.status(400).send();
				return;
			}
			return Account.find({
				where : {
					id : accessKey.AccountId
				}
			});
		}).then(function(account) {
			if (!account) {
				res.status(400).send();
				return;
			}
			res.status(200).json(account);
		})
		return;
	} else {
		res.status(400).send();
	}
});
router.get('/signin', function(req, res) {
	if (null == req.query.mail || "" == req.query.mail || null == req.query.password || "" == req.query.password) {
		res.status(400).send();
		return;
	}
	Account.find({
		where : {
			mail : req.query.mail
		}
	}).then(function(account) {
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
				createRandomBase62(function(sessionKey) {
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
			console.log(error);
			res.status(500).end();
		});
	})["catch"](function(error) {
		console.log(error);
		res.status(500).end();
	})
});
router.post('/sendResetpasswordMail', function(req, res) {
	if (null == req.body.mail || "" == req.body.mail) {
		res.status(400).send();
		return;
	}
	Account.find({
		where : {
			mail : req.body.mail
		}
	}).then(function(account) {
		if (!account) {
			res.status(400).send();
			return;
		}
		createRandomBase62(function(random) {
			AccessKey.create({
				AccountId : account.id,
				secret : random,
				type : AccessKey.TYPE_RESETMAIL,
				status : AccessKey.STATUS_CREATED
			}).then(function(activationKey) {
				if (!activationKey) {
					res.status(400).end();
				} else {
					res.status(200).json(activationKey);
					sendResetPasswordMail(account, random);
				}
			})["catch"](function(error) {
				console.log(error);
				res.status(500).end();
			});
		});
	})["catch"](function(error) {
		console.log(error);
		res.status(500).end();
	})
});
router.put('/resetPassword', function(req, res) {
	if (null == req.body.password || "" == req.body.password || null == req.body.key || "" == req.body.key) {
		res.status(400).send();
		return;
	}
	var accountId;
	AccessKey.find({
		where : {
			secret : req.body.key,
			type : AccessKey.TYPE_RESETMAIL,
			status : AccessKey.STATUS_CREATED
		}
	}).then(function(passwordResetAccessKey) {
		if (!passwordResetAccessKey) {
			res.status(400).send();
			throw "accessKey not found";
		}
		accountId = passwordResetAccessKey.AccountId;
		return passwordResetAccessKey.destroy();
	}).then(function(passwordResetAccessKey) {
		return Account.find({
			where : {
				id : accountId
			}
		})
	}).then(function(account) {
		if (!account) {
			res.status(400).send();
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
		console.log(error);
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
		content : renderer.render('activationMailTemplate.ect', dataForTemplate)
	}, function(err, reply) {
		if (err) {
			errorFunc(error.stack, replay);
		}
	});
}
var createRandomBase62 = function(callbackFunc) {
	crypto.randomBytes(48, function(ex, buf) {
		var base62 = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
		callbackFunc(base62);
	});
}
module.exports = router;