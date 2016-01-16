var Random = require(__dirname + "/../util/random");
var Promise = require("bluebird");
module.exports = function(sequelize, DataTypes) {
	var Message = sequelize.define("Message", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		body : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "accessKey", "createdAt", "deletedAt" ]
		} ]
	});
	Message.associate = function(sequelize) {
		Message.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Message.belongsTo(sequelize.Bot);
		Message.belongsTo(sequelize.Channel, {
			as : 'channel'
		});
	}
	Message.handleMessage = function(account, channel, body) {
		return new Promise(function(success, fail) {
			var matchToRemind;
			if ((matchToRemind = body.match(/^\/remind[\p{blank}\s]+([0-2]?[0-9]):([0-5]?[0-9])[\p{blank}\s]+([\s\S]+)$/))) {
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
				global.db.TimerTask.create({
					targetDate : targetDate,
					config : JSON.stringify({
						ownerId : account.id,
						channelId : channel.id,
						message : message
					}),
					type : global.db.TimerTask.TYPE_REMIND,
					repeatType : global.db.TimerTask.REPEAT_TYPE_NONE
				}).then(function(timerTask) {
					success(timerTask);
					global.socket.sendRemindAppendedEventToAccount(account.id, targetDate.getTime(), message);
				})["catch"](fail)
			} else {
				Random.createRandomBase62().then(function(random) {
					return global.db.Message.create({
						body : body,
						ownerId : account.id,
						channelId : channel.id,
						accessKey : random,
						type : global.db.Message.TYPE_MARKDOWN
					})
				}).then(function(message) {
					message.dataValues.owner = account;
					message.owner = account;
					success(message);
					global.socket.sendToChannel(channel.accessKey, message);
					global.db.NotificationTarget.notifyToChannel(channel, message);
				})["catch"](fail);
			}
		});
	}
	Message.TYPE_MARKDOWN = "markdown";
	Message.TYPE_REMIND = "remind";
	return Message;
};