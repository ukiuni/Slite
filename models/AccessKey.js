module.exports = function(sequelize, DataTypes) {
	var AccessKey = sequelize.define("AccessKey", {
		secret : DataTypes.TEXT,
		status : DataTypes.INTEGER,
		type : DataTypes.INTEGER,
		expires : DataTypes.DATE
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "secretIndex",
			fields : [ "secret" ]
		} ]
	});
	AccessKey.associate = function(sequelize) {
		AccessKey.belongsTo(sequelize.Account);
	}
	AccessKey.TYPE_ACTIVATION = 1;
	AccessKey.TYPE_LOGIN = 2;
	AccessKey.TYPE_SESSION = 3;
	AccessKey.TYPE_RESETMAIL = 3;
	AccessKey.STATUS_CREATED = 1;
	AccessKey.STATUS_DISABLED = 2;
	return AccessKey;
};