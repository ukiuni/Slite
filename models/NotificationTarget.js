var request = require('request');
var gcm = require(__dirname + "/../util/gcm");
module.exports = function(sequelize, DataTypes) {
	var NotificationTarget = sequelize.define("NotificationTarget", {
		secret : DataTypes.TEXT,
		status : DataTypes.INTEGER,
		key : DataTypes.TEXT,
		endpoint : DataTypes.TEXT,
		platformParameter : DataTypes.TEXT,
		platform : DataTypes.INTEGER,
		expires : DataTypes.DATE
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "notification_target_owner",
			fields : [ "ownerId", "deletedAt" ]
		} ]
	});
	NotificationTarget.associate = function(sequelize) {
		NotificationTarget.belongsTo(sequelize.Account, {
			as : "owner"
		});
	};
	var notifyToAndroid = function(notificationTarget, message) {
		gcm.push(notificationTarget.endpoint, message)["catch"](function(error) {
			console.log("#### GCM failed " + error);
		});
	}
	var webhook = function(notificationTarget, message) {
		request(notificationTarget.endpoint, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("webhooked to " + notificationTarget.endpoint);
			} else {
				console.log("webhook failed to " + notificationTarget.endpoint + ", error = " + error + ", " + response.statusCode);
			}
		});
	}
	NotificationTarget.notifyToChannel = function(channel, message) {
		return global.db.AccountInGroup.findAll({
			where : {
				GroupId : channel.GroupId,
				inviting : global.db.Group.INVITING_DONE
			},
			attributes : [ "AccountId" ]
		}).then(function(accountInGroups) {
			var ids = accountInGroups.map(function(accountInGroup) {
				return accountInGroup.AccountId;
			});
			return global.db.NotificationTarget.findAll({
				where : {
					ownerId : {
						$in : ids
					}
				}
			})
		}).then(function(notificationTargets) {
			message.dataValues.channel = channel;
			message.dataValues.type = "message";
			notificationTargets.forEach(function(notificationTarget) {
				if (NotificationTarget.PLATFORM_ANDROID == notificationTarget.platform) {
					notifyToAndroid(notificationTarget, message);
				} else if (NotificationTarget.PLATFORM_WEBHOOK == notificationTarget.platform) {
					webhook(notificationTarget, message);
				}
			});
		});
	}
	NotificationTarget.PLATFORM_ANDROID = 1;
	NotificationTarget.PLATFORM_IOS = 2;
	NotificationTarget.PLATFORM_PUSHBULLET = 3;
	NotificationTarget.PLATFORM_WEBHOOK = 4;
	NotificationTarget.STATUS_CREATED = 1;
	NotificationTarget.STATUS_DISABLED = 2;
	return NotificationTarget;
};