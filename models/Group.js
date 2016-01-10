var Promise = require("bluebird");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
module.exports = function(sequelize, DataTypes) {
	var Group = sequelize.define("Group", {
		name : {
			type : DataTypes.TEXT,
			unique : true
		},
		imageUrl : DataTypes.TEXT,
		description : DataTypes.TEXT,
		visibility : DataTypes.INTEGER,
		accessKey : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "groupName",
			fields : [ "name" ]
		}, {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	Group.associate = function(sequelize) {
		Group.hasMany(sequelize.Content);
		Group.hasMany(sequelize.Channel);
		Group.belongsToMany(sequelize.Account, {
			through : sequelize.AccountInGroup
		});
		Group.hasMany(sequelize.AccountConfig);
		Group.hasMany(sequelize.Bot);
	}
	Group.findAccessible = function(sessionKey, groupAccessKey) {
		if (!sessionKey || !groupAccessKey) {
			return new Promise(function(success, fail) {
				fail(ERROR_NOTACCESSIBLE);
			})
		}
		var loadedGroup;
		var loadedAccount;
		return global.db.AccessKey.findBySessionKey(sessionKey).then(function(accessKey) {
			if (!accessKey) {
				throw ERROR_NOTACCESSIBLE;
			}
			return accessKey.getAccount();
		}).then(function(account) {
			if (!account) {
				throw ERROR_NOTACCESSIBLE;
			}
			loadedAccount = account;
			return global.db.Group.find({
				where : {
					accessKey : groupAccessKey
				}
			});
		}).then(function(group) {
			if (!group) {
				throw ERROR_NOTFOUND;
			}
			loadedGroup = group;
			return global.db.AccountInGroup.find({
				where : {
					AccountId : loadedAccount.id,
					GroupId : loadedGroup.id,
					inviting : Group.INVITING_DONE
				}
			})
		}).then(function(accountInGroup) {
			if (!accountInGroup) {
				throw ERROR_NOTACCESSIBLE;
			}
			return new Promise(function(success) {
				success({
					group : loadedGroup,
					account : loadedAccount,
					accountInGroup : accountInGroup
				})
			})
		});
	}
	Group.VISIBILITY_OPEN = 1;
	Group.VISIBILITY_SECRET = 2;
	Group.VISIBILITY_SECRET_EVEN_MEMBER = 3;
	Group.INVITING_START = 1;
	Group.INVITING_REQUESTED = 2;
	Group.INVITING_DONE = 3;
	Group.INVITING_REJECTED = 4;
	return Group;
};