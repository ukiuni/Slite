module.exports = function(sequelize, DataTypes) {
	var Message = sequelize.define("Message", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		body : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {}
	});
	Message.associate = function(sequelize) {
		Message.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Message.belongsTo(sequelize.Group, {
			as : 'group'
		});
	}
	Message.TYPE_MARKDOWN = "markdown";
	return Message;
};