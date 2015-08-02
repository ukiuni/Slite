module.exports = function(sequelize, DataTypes) {
	var AccessKey = sequelize.define("AccessKey", {
		token : DataTypes.TEXT,
		secret : DataTypes.TEXT,
		status : DataTypes.INTEGER,
		type : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "tokenIndex",
			fields : [ "token" ]
		}, {
			name : "secretIndex",
			fields : [ "secret" ]
		} ]
	});
	AccessKey.associate = function(sequelize) {
		AccessKey.belongsTo(sequelize.Account);
	}
	AccessKey.TYPE_ACTIVATION = 1;
	AccessKey.TYPE_LOGIN = 2;
	AccessKey.STATUS_CREATED = 1;
	AccessKey.STATUS_DISABLED = 2;
	return AccessKey;
};