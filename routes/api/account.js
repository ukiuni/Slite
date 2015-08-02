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
		crypto.randomBytes(48, function(ex, buf) {
			var accountKey = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
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
					crypto.randomBytes(48, function(ex, buf) {
						var secret = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
						AccessKey.create({
							secret : secret,
							type : AccessKey.TYPE_ACTIVATION,
							status : AccessKey.STATUS_CREATED
						}).then(function(accessKey) {
							return accessKey.setAccount(account).then(function() {
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
router.get('/signin', function(req, res) {
	if (null == req.body.mail || "" == req.body.mail || null == req.body.password || "" == req.body.password) {
		res.status(400).send();
		return;
	}
	Account.find({
		where : {
			mail : req.body.mail
		}
	}).then(function(account) {
		return AccessKey.find({
			where : {
				accountId : account.id,
				secret : hash(req.body.password),
				type : AccessKey.TYPE_LOGIN
			}
		});
	}).then(function(activationKey) {
		if (!activationKey) {
			res.status(400).end();
		} else {
			res.status(200).json(account);
		}
	})["catch"](function(error) {
		console.log(error);
		res.status(500).end();
	})
});
module.exports = router;