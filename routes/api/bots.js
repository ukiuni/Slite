var express = require('express');
var router = express.Router();
var Channel = global.db.Channel;
var Account = global.db.Account;
var Bot = global.db.Bot;
var Random = require(__dirname + "/../../util/random");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
router.post('/', function(req, res) {
	var sessionKey = req.body.sessionKey || req.body.access_token;
	if (!sessionKey || !req.body.channelAccessKey || !req.body.type) {
		res.status(400).end();
		return;
	}
	var loadedAccount;
	var loadedChannel;
	Channel.resolveChannel(sessionKey, req.body.channelAccessKey).then(function(result) {
		loadedAccount = result.loadedAccount;
		loadedChannel = result.loadedChannel;
		return Random.createRandomBase62();
	}).then(function(random) {
		var type = "gitlab" == req.body.type ? Bot.TYPE_GITLAB : 0;
		return Bot.create({
			key : random,
			type : type,
			ownerId : loadedAccount.id,
			ChannelId : loadedChannel.id,
			name : "gitlab",
			iconUrl : "/images/gitlab.png"
		})
	}).then(function(bot) {
		res.status(201).json(bot);
	})["catch"](function(error) {
		if (ERROR_NOTACCESSIBLE == error) {
			res.status(403).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
	});
});
router.post('/events/webhook/:accessKey', function(req, res) {
	if (!req.params.accessKey) {
		res.status(400).end();
		return;
	}
	Bot.findForSendMessage(req.params.accessKey).then(function(bot) {
		if (!bot) {
			throw ERROR_NOTFOUND;
		}
		return bot.handleGitrabRequest(req.body);
	}).then(function() {
		res.status(200).end();
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