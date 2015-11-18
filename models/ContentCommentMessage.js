module.exports = function(sequelize, DataTypes) {
	var ContentCommentMessage = sequelize.define("ContentCommentMessage", {
		version : DataTypes.BIGINT,
		message : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "contentCommentMessageContentCommentIdVersion",
			fields : [ "ContentCommentId", "version" ]
		} ]
	});
	ContentCommentMessage.associate = function(sequelize) {
		ContentCommentMessage.belongsTo(sequelize.Account, {
			as : 'updator'
		});
		ContentCommentMessage.belongsTo(sequelize.ContentComment);
	}
	return ContentCommentMessage;
};