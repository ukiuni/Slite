var Random = require(__dirname + "/../util/random");
var Promise = require("bluebird");
module.exports = function(sequelize, DataTypes) {
	var Message = sequelize.define("Message", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		body : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			fields : [ "accessKey", "createdAt", "deletedAt" ]
		} ]
	});
	Message.associate = function(sequelize) {
		Message.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Message.belongsTo(sequelize.Bot);
		Message.belongsTo(sequelize.Channel, {
			as : 'channel'
		});
	}
	Message.TYPE_MARKDOWN = "markdown";
	Message.TYPE_REMIND = "remind";
	return Message;
};