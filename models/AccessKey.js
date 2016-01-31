var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
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
	AccessKey.findBySessionKey = function(sessionKey) {
		if (!sessionKey) {
			return new Promise(function(s, fail) {
				fail(ERROR_NOTACCESSIBLE);
			});
		}
		return global.db.AccessKey.find({
			where : {
				secret : sessionKey,
				type : {
					$or : [ {
						$eq : AccessKey.TYPE_SESSION
					}, {
						$eq : AccessKey.TYPE_GENERATE_SESSION
					} ]
				},
				status : AccessKey.STATUS_CREATED
			}
		});
	}
	AccessKey.TYPE_ACTIVATION = 1;
	AccessKey.TYPE_LOGIN = 2;
	AccessKey.TYPE_SESSION = 3;
	AccessKey.TYPE_RESETMAIL = 4;
	AccessKey.TYPE_INVITATION = 5;
	AccessKey.TYPE_GENERATE_SESSION = 6;
	AccessKey.STATUS_CREATED = 1;
	AccessKey.STATUS_DISABLED = 2;
	return AccessKey;
};