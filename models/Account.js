module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account", {
		mail : DataTypes.TEXT,
		name : DataTypes.TEXT,
		information : DataTypes.TEXT,
		iconUrl : DataTypes.TEXT,
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
	Account.associate = function(sequelize) {
		Account.hasMany(sequelize.Content, {
			foreignKey : "ownerId"
		});
		Account.hasMany(sequelize.ContentBody, {
			foreignKey : "updatorId"
		});
	}
	return Account;
};