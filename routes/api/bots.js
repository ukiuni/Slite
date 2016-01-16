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
	Channel.resolveChannelInGroup(sessionKey, req.body.channelAccessKey).then(function(result) {
		loadedAccount = result.loadedAccount;
		loadedChannel = result.loadedChannel;
		return Random.createRandomBase62();
	}).then(function(random) {
		if ("gitlab" == req.body.type) {
			var type = Bot.TYPE_GITLAB;
			var name = "gitlab";
			var iconUrl = "/images/gitlab.png";
		} else {
			var type = Bot.TYPE_GITHUB;
			var name = "github";
			var iconUrl = "/images/github.png";
		}
		return Bot.create({
			key : random,
			type : type,
			ownerId : loadedAccount.id,
			ChannelId : loadedChannel.id,
			name : name,
			iconUrl : iconUrl
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
		var githubHeader = req.header("X-Github-Event");
		var type;
		if (githubHeader) {
			type = Bot.TYPE_GITHAB;
			req.body.event = githubHeader;
		} else {
			type = Bot.TYPE_GITLAB;
		}
		return bot.handleWebhookRequest(type, req.body);
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