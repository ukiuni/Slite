var Promise = require("bluebird");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
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
		Channel.belongsToMany(sequelize.Account, {
			through : sequelize.AccountInChannel
		});
	}
	Channel.resolveChannelInGroup = function(sessionKey, channelAccessKey) {
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
	Channel.getAccessiblePrivateChannel = function(sessionKey, channelAccessKey) {
		var accountId;
		var loadedChannel;
		return global.db.AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			accountId = accessKey.AccountId;
			return global.db.Channel.find({
				where : {
					accessKey : channelAccessKey
				}
			})
		}).then(function(channel) {
			if (!channel) {
				throw ERROR_NOTFOUND;
			}
			loadedChannel = channel;
			return global.db.AccountInChannel.find({
				where : {
					ChannelId : loadedChannel.id,
					AccountId : accountId
				// ,type : global.db.Channel.TYPE_PRIVATE
				}
			})
		}).then(function(accountInChannel) {
			if (!accountInChannel) {
				throw ERROR_NOTACCESSIBLE;
			}
			return new Promise(function(success) {
				success({
					channel : loadedChannel,
					AccountId : accountInChannel.AccountId
				});
			})
		})
	}
	Channel.loadAccessibleChannel = function(sessionKeyOrAccountId, channelAccessKey) {
		if (!sessionKeyOrAccountId || !channelAccessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		var loadedAccount;
		var loadedChannel;
		return new Promise(function(success) {
			success()
		}).then(function() {
			if (Math.round(sessionKeyOrAccountId) === sessionKeyOrAccountId) {
				return new Promise(function(success) {
					success({
						AccountId : sessionKeyOrAccountId
					})
				});
			} else {
				return global.db.AccessKey.findBySessionKey(sessionKeyOrAccountId);
			}
		}).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			return global.db.Account.findById(accessKey.AccountId);
		}).then(function(account) {
			if (!account) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedAccount = account;
			return global.db.Channel.find({
				where : {
					accessKey : channelAccessKey
				}
			});
		}).then(function(channel) {
			if (!channel) {
				throw ERROR_NOTFOUND;
			}
			loadedChannel = channel;
			if (Channel.TYPE_PRIVATE == channel.type) {
				return global.db.AccountInChannel.find({
					where : {
						ChannelId : channel.id,
						AccountId : loadedAccount.id
					}
				});
			} else {
				return global.db.AccountInGroup.find({
					where : {
						GroupId : channel.GroupId,
						AccountId : loadedAccount.id
					}
				})
			}
		}).then(function(accountInChannel) {
			if (!accountInChannel) {
				throw ERROR_NOTACCESSIBLE;
			}
			return new Promise(function(success) {
				success({
					account : loadedAccount,
					channel : loadedChannel
				});
			});
		})
	}
	Channel.TYPE_PRIVATE = "private";
	return Channel;
};