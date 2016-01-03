module.exports = function(sequelize, DataTypes) {
	var Channel = sequelize.define("Channel", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		name : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	Channel.associate = function(sequelize) {
		Channel.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Channel.belongsTo(sequelize.Group);
		Channel.hasMany(sequelize.Message, {
			foreignKey : "channelId"
		});
		Channel.hasMany(sequelize.Bot);
	}
	Channel.resolveChannel = function(sessionKey, channelAccessKey) {
		var loadedAccount;
		var loadedChannel;
		var createdMessage;
		return global.db.AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			return global.db.Account.find({
				where : {
					id : accessKey.AccountId
				},
				attributes : [ "id", "name", "iconUrl" ]
			});
		}).then(function(account) {
			if (!account) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedAccount = account;
			return global.db.Channel.find({
				where : {
					accessKey : channelAccessKey
				},
				include : [ {
					model : global.db.Group
				} ]
			});
		}).then(function(channel) {
			if (!channel) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedChannel = channel;
			return global.db.AccountInGroup.find({
				where : {
					AccountId : loadedAccount.id,
					GroupId : loadedChannel.GroupId,
					inviting : global.db.Group.INVITING_DONE
				}
			});
		}).then(function(accountInGroup) {
			if (!accountInGroup) {
				throw ERROR_NOTACCESSIBLE;
			}
			return new Promise(function(success) {
				success({
					loadedAccount : loadedAccount,
					loadedChannel : loadedChannel
				});
			});
		})
	}
	return Channel;
};