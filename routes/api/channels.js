var express = require('express');
var router = express.Router();
var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Channel = global.db.Channel;
var Message = global.db.Message;
var AccountInGroup = global.db.AccountInGroup;
var AccountInChannel = global.db.AccountInChannel;
var Random = require(__dirname + "/../../util/random");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
var ERROR_DUPLICATED = "ERROR_DUPLICATED";
router.post('/', function(req, res) {
	var sessionKey = req.body.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	if (!req.body.name || !req.body.targetAccountId) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var createdChannel;
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
		return AccountInGroup.findAll({
			where : {
				AccountId : loadedAccount.id
			}
		});
	}).then(function(ownerAccountInGroups) {
		if (0 == ownerAccountInGroups.length) {
			throw ERROR_NOTACCESSIBLE
		}
		var ownerJoiningGroupIds = ownerAccountInGroups.map(function(ownerAccountInGroup) {
			return ownerAccountInGroup.GroupId;
		});
		return AccountInGroup.findAll({
			where : {
				AccountId : parseInt(req.body.targetAccountId),
				GroupId : {
					$in : ownerJoiningGroupIds
				},
			}
		});
	}).then(function(targetAccountInGroups) {
		if (0 == targetAccountInGroups.length) {
			throw ERROR_NOTACCESSIBLE
		}
		return Random.createRandomBase62();
	}).then(function(random) {
		return Channel.create({
			ownerId : loadedAccount.id,
			accessKey : random,
			name : req.body.name
		});
	}).then(function(channel) {
		createdChannel = channel;
		createdChannel.dataValues.owner = loadedAccount;
		return AccountInChannel.create({
			ChannelId : createdChannel.id,
			AccountId : loadedAccount.id,
			type : AccountInChannel.TYPE_JOIN
		});
	}).then(function() {
		return AccountInChannel.create({
			ChannelId : createdChannel.id,
			AccountId : parseInt(req.body.targetAccountId),
			type : AccountInChannel.TYPE_JOIN
		});
	}).then(function() {
		res.status(201).json(createdChannel);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.post('/:channelAccessKey/messages', function(req, res) {
	var sessionKey = req.body.sessionKey || req.body.access_token;
	if (!sessionKey) {
		res.status(400).end();
		return;
	}
	if (!req.params.channelAccessKey || !req.body.body) {
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
			}
		});
	}).then(function(channel) {
		if (!channel) {
			throw ERROR_NOTFOUND;
		}
		loadedChannel = channel;
		return AccountInChannel.find({
			where : {
				ChannelId : channel.id,
				AccountId : loadedAccount.id
			}
		});
	}).then(function(accountInChannel) {
		if (!accountInChannel) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Message.handleMessage(loadedAccount, loadedChannel, req.body.body);
	}).then(function(result) {
		res.status(201).json(result);
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
module.exports = router;