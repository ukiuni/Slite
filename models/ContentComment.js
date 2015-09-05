module.exports = function(sequelize, DataTypes) {
	var ContentComment = sequelize.define("ContentComment", {
		currentVersion : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "contentCommentContentIdCreatedAt",
			fields : [ "ContentId", "createdAt" ]
		} ]
	});
	ContentComment.associate = function(sequelize) {
		ContentComment.belongsTo(sequelize.Content);
		ContentComment.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		ContentComment.hasMany(sequelize.ContentCommentMessage);
	}
	return ContentComment;
};