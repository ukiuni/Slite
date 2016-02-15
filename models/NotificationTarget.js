var request = require('request');
var Promise = require('bluebird');
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
	var notifyMessageToAndroid = function(notificationTarget, channel, message) {
		var pushValue = {
			type : "message",
			message : {
				body : message.body,
				fromAccount : {
					id : message.owner.id,
					name : message.owner.name,
					iconUrl : message.owner.iconUrl
				},
				toAccountId : notificationTarget.ownerId,
				createdAt : message.createdAt,
				channel : channel,
			}
		}
		if (message.bot) {
			pushValue.message.bot = message.bot;
		}
		gcm.push(notificationTarget.endpoint, pushValue)["catch"](function(error) {
			console.log("#### GCM failed " + error);
		});
	}
	var notifyMessageToCordova = function(notificationTarget, channel, message) {
		var pushValue = {
			type : "message",
			title : message.owner.name + "@" + channel.name,
			message : message.body,
			info : {
				body : message.body,
				fromAccount : {
					id : message.owner.id,
					name : message.owner.name,
					iconUrl : message.owner.iconUrl
				},
				toAccountId : notificationTarget.ownerId,
				createdAt : message.createdAt,
				channel : channel,
			}
		}
		if (message.bot) {
			pushValue.message.bot = message.bot;
		}
		gcm.push(notificationTarget.endpoint, pushValue)["catch"](function(error) {
			console.log("#### GCM failed " + error);
		});
	}
	var webhookMessage = function(notificationTarget, channel, message) {
		request(notificationTarget.endpoint, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("webhooked to " + notificationTarget.endpoint);
			} else {
				console.log("webhook failed to " + notificationTarget.endpoint + ", error = " + error + ", " + (response ? response.statusCode : null));
			}
		});
	}
	NotificationTarget.notifyToChannel = function(channel, message) {
		var loadTarget;
		if (channel.GroupId && 0 != channel.GroupId) {
			loadTarget = function() {
				return global.db.AccountInGroup.findAll({
					where : {
						GroupId : channel.GroupId,
						inviting : global.db.Group.INVITING_DONE
					},
					attributes : [ "AccountId" ]
				}).then(function(accountInGroups) {
					return new Promise(function(success) {
						var ids = accountInGroups.map(function(accountInGroup) {
							return accountInGroup.AccountId;
						});
						success(ids)
					})
				})
			}
		} else {
			loadTarget = function() {
				return global.db.AccountInChannel.findAll({
					where : {
						ChannelId : channel.id,
					// inviting : global.db.AccountInChannel.INVITING_DONE
					// TODO for security
					},
					attributes : [ "AccountId" ]
				}).then(function(accountInChannels) {
					return new Promise(function(success) {
						var ids = accountInChannels.map(function(accountInChannel) {
							return accountInChannel.AccountId;
						});
						success(ids)
					})
				})
			}
		}
		return loadTarget().then(function(accountIds) {
			return global.db.NotificationTarget.findAll({
				where : {
					ownerId : {
						$in : accountIds
					}
				}
			})
		}).then(function(notificationTargets) {
			var notifyTargetPonged = [];
			var registedListener = [];
			notificationTargets.forEach(function(notificationTarget) {
				var listener = function(data) {
					notifyTargetPonged[notificationTarget.ownerId] = true;
				};
				global.socket.pingListening(notificationTarget.ownerId, channel.accessKey, listener);
				registedListener.push({
					ownerId : notificationTarget.ownerId,
					accessKey : channel.accessKey,
					listener : listener
				});
			});
			setTimeout(function() {
				notificationTargets.forEach(function(notificationTarget) {
					if (notifyTargetPonged[notificationTarget.ownerId]) {
						return;
					}
					if (NotificationTarget.PLATFORM_ANDROID == notificationTarget.platform) {
						notifyMessageToAndroid(notificationTarget, channel, message);
					} else if (NotificationTarget.PLATFORM_CORDOVA_ANDROID == notificationTarget.platform) {
						notifyMessageToCordova(notificationTarget, channel, message);
					} else if (NotificationTarget.PLATFORM_WEBHOOK == notificationTarget.platform) {
						webhookMessage(notificationTarget, channel, message);
					}
				});
				registedListener.forEach(function(listener) {
					global.socket.stopPingListening(listener.ownerId, listener.accessKey, listener.listener);
				})
			}, 2000)
		});
	}
	NotificationTarget.PLATFORM_ANDROID = 1;
	NotificationTarget.PLATFORM_IOS = 2;
	NotificationTarget.PLATFORM_PUSHBULLET = 3;
	NotificationTarget.PLATFORM_WEBHOOK = 4;
	NotificationTarget.PLATFORM_CORDOVA_ANDROID = 5;
	NotificationTarget.STATUS_CREATED = 1;
	NotificationTarget.STATUS_DISABLED = 2;
	return NotificationTarget;
};