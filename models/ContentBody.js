module.exports = function(sequelize, DataTypes) {
	var ContentBody = sequelize.define("ContentBody", {
		version : DataTypes.BIGINT,
		status : DataTypes.INTEGER,
		title : DataTypes.TEXT,
		article : DataTypes.TEXT,
		topImageUrl : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "contentBodyContentIdVersion",
			fields : [ "ContentId", "version" ]
		} ]
	});
	ContentBody.associate = function(sequelize) {
		ContentBody.belongsTo(sequelize.Content);
		ContentBody.belongsTo(sequelize.Account, {
			as : 'updator'
		});
	}
	ContentBody.STATUS_OPEN = 1;
	ContentBody.STATUS_HIDDEN = 2;
	ContentBody.STATUS_URLACCESS = 3;
	ContentBody.STATUS_AUTHENTICATEDONLY = 4;
	return ContentBody;
};