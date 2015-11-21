module.exports = function(sequelize, DataTypes) {
	var File = sequelize.define("File", {
		accessKey : DataTypes.TEXT,
		contentType : DataTypes.TEXT,
		name : DataTypes.TEXT,
		service : DataTypes.TEXT,
		serviceKey : DataTypes.TEXT,
		size : DataTypes.BIGINT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	File.associate = function(sequelize) {
		File.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		File.belongsTo(sequelize.Content);
		File.belongsTo(sequelize.Group);
	}
	File.SERVICE_S3 = "S3";
	return File;
};