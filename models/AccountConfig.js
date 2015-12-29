module.exports = function(sequelize, DataTypes) {
	var AccountConfig = sequelize.define("AccountConfig", {
		key : DataTypes.TEXT,
		description : DataTypes.TEXT,
		value : DataTypes.TEXT,
		type : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "id", "ownerId", "type" ]
		} ]
	});
	AccountConfig.associate = function(sequelize) {
		AccountConfig.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		AccountConfig.belongsTo(sequelize.Group);
	}
	AccountConfig.TYPE = "S3";
	return AccountConfig;
};