module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define("Account", {
		accountKey : DataTypes.TEXT,
		mail : DataTypes.TEXT,
		name : DataTypes.TEXT,
		iconUrl : DataTypes.TEXT,
		status : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			sanitize : function() {
				return {
					accountKey : this.accountKey,
					name : this.name,
					iconUrl : this.iconUrl
				}
			}
		}
	});
	return Account;
};