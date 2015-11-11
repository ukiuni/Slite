module.exports = function(sequelize, DataTypes) {
	var Channel = sequelize.define("Channel", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		name : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	Channel.associate = function(sequelize) {
		Channel.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Channel.belongsTo(sequelize.Group);
		Channel.hasMany(sequelize.Message);
	}
	return Channel;
};