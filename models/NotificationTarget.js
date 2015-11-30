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
	var notifyToAndroid = function(notificationTarget) {
		
	}
	NotificationTarget.notifyToChannel = function(channel, message) {
		return AccountInGroup.findAll({
			where : {
				GroupId : channel.GroupId,
				inviting : Group.INVITING_DONE
			},
			attributes : [ "AccountId" ]
		}).then(function(accountInGroups) {
			var ids = accountInGroups.map(function(accountInGroup) {
				return accountInGroup.AccountId;
			});
			return NotificationTarget.findAll({
				where : {
					ownerId : {
						$in : ids
					}
				}
			})
		}).then(function(notificationTargets) {
			notificationTargets.forEach(function(notificationTarget) {
				if (NotificationTarget.PLATFORM_ANDROID == notificationTarget.platform) {
					notifyToAndroid(notificationTarget);
				}
			});
		});
	}
	NotificationTarget.PLATFORM_ANDROID = 1;
	NotificationTarget.PLATFORM_IOS = 2;
	NotificationTarget.PLATFORM_PUSHBULLET = 3;
	NotificationTarget.PLATFORM_POST = 4;
	NotificationTarget.STATUS_CREATED = 1;
	NotificationTarget.STATUS_DISABLED = 2;
	return NotificationTarget;
};