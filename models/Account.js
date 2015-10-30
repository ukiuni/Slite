var Promise = require("bluebird");
var Random = require(__dirname + "/../util/random");
module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account", {
		mail : {
			type : DataTypes.TEXT,
			unique : true
		},
		name : DataTypes.TEXT,
		information : DataTypes.TEXT,
		iconUrl : DataTypes.TEXT,
		language : DataTypes.TEXT,
		status : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			sanitize : function() {
				return {
					name : this.name,
					iconUrl : this.iconUrl
				}
			}
		}
	});
	Account.findOrInvite = function(mail) {
		return new Promise(function(success, fail) {
			global.db.Account.find({
				where : {
					mail : mail
				}
			}).then(function(account) {
				if (account) {
					success(account);
				} else {
					var createdAccount;
					Account.create({
						mail : mail,
						status : Account.STATUS_INVITING
					}).then(function(account) {
						createdAccount = account;
						return Random.createRandomBase62();
					}).then(function(activationKey) {
						return global.db.AccessKey.create({
							AccountId : createdAccount.id,
							secret : activationKey,
							type : global.db.AccessKey.TYPE_SESSION,
							status : global.db.AccessKey.STATUS_CREATED
						});
					}).then(function(accessKey) {
						createdAccount.inviteKey = accessKey;
						success(createdAccount);
					})["catch"](function(error) {
						fail(error)
					});
				}
			})["catch"](function(error) {
				fail(error)
			});
		});
	}
	Account.associate = function(sequelize) {
		Account.hasMany(sequelize.Content, {
			foreignKey : "ownerId"
		});
		Account.hasMany(sequelize.ContentBody, {
			foreignKey : "updatorId"
		});
		Account.hasMany(sequelize.ContentComment, {
			foreignKey : "ownerId"
		});
		Account.hasMany(sequelize.ContentCommentMessage, {
			foreignKey : "updatorId"
		});
		Account.belongsToMany(sequelize.Group, {
			through : sequelize.AccountInGroup
		});
	};
	Account.AUTHORIZATION_VIEWER = 1;
	Account.AUTHORIZATION_EDITOR = 2;
	Account.AUTHORIZATION_ADMIN = 3;
	Account.STATUS_INVITING = 1;
	Account.STATUS_REQUEST_ACTIVATION = 2;
	Account.STATUS_ACTIVATED = 3;
	return Account;
};