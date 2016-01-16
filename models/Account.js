var Promise = require("bluebird");
var Random = require(__dirname + "/../util/random");
module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account", {
		mail : {
			type : DataTypes.TEXT,
			unique : true,
			valiate : {
				isEmail: true
			}
		},
		name : {
			type : DataTypes.TEXT,
			unique : true,
			validate : {
				is : ["^[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9]+$", "i"]
			}
		},
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
			},
			setConfig : function(key, value, description) {
				var self = this;
				return global.db.AccountConfig.find({
					where : {
						key : key
					}
				}).then(function(config) {
					if (config) {
						return config.destroy();
					}
				}).then(function() {
					return global.db.AccountConfig.create({
						ownerId : self.id,
						key : key,
						value : value,
						description : description
					})
				})
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
					if (Account.STATUS_INVITING == account.status || Account.STATUS_REQUEST_ACTIVATION == account.status) {
						return Random.createRandomBase62().then(function(random) {
							return global.db.AccessKey.create({
								AccountId : account.id,
								secret : random,
								type : global.db.AccessKey.TYPE_INVITATION,
								status : global.db.AccessKey.STATUS_CREATED
							});
						}).then(function(accessKey) {
							account.inviteKey = accessKey;
							success(account);
						})["catch"](function(error) {
							fail(error)
						});
					} else {
						success(account);
					}
				} else {
					var createdAccount;
					return Account.create({
						mail : mail,
						status : Account.STATUS_INVITING
					}).then(function(account) {
						createdAccount = account;
						return Random.createRandomBase62();
					}).then(function(random) {
						return global.db.AccessKey.create({
							AccountId : createdAccount.id,
							secret : random,
							type : global.db.AccessKey.TYPE_INVITATION,
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
	};
	Account.aggregate = function(baseAccount, aggregateAccount) {
		return global.db.AccountInGroup.findAll({
			where : {
				AccountId : baseAccount.id
			}
		}).then(function(existAssociations) {
			var existingGroupIds = existAssociations.map(function(association) {
				return association.GroupId
			});
			return global.db.AccountInGroup.update({
				AccountId : baseAccount.id
			}, {
				where : {
					AccountId : aggregateAccount.id,
					GroupId : {
						$notIn : existingGroupIds
					}
				}
			});
		}).then(function(updatedAccountInGroups) {
			return global.db.AccountInGroup.destroy({
				where : {
					AccountId : aggregateAccount.id,
				}
			});
		}).then(function(deletedAccountInGroups) {
			return global.db.Content.update({
				ownerId : baseAccount.id
			}, {
				where : {
					ownerId : aggregateAccount.id
				}
			});
		}).then(function(accountInGroups) {
			return global.db.ContentComment.update({
				ownerId : baseAccount.id
			}, {
				where : {
					ownerId : aggregateAccount.id
				}
			});
		}).then(function(accountInGroups) {
			return aggregateAccount.destroy()
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
		Account.belongsToMany(sequelize.Channel, {
			through : sequelize.AccountInChannel
		});
		Account.hasMany(sequelize.NotificationTarget, {
			foreignKey : "ownerId"
		});
		Account.hasMany(sequelize.AccountConfig, {
			foreignKey : "ownerId"
		});
		Account.hasMany(sequelize.Bot, {
			foreignKey : "ownerId"
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