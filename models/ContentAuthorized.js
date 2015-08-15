module.exports = function(sequelize, DataTypes) {
	var ContentAuthorized = sequelize.define("ContentAuthorized", {
		type : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {},
		indexes : [ {
			name : "accessibleIndex",
			fields : [ "ContentId", "AccountId" ]
		} ]
	});
	ContentAuthorized.associate = function(sequelize) {
		ContentAuthorized.belongsTo(sequelize.Content);
		ContentAuthorized.belongsTo(sequelize.Account);
	}
	ContentAuthorized.TYPE_VISIBLE = 1;
	ContentAuthorized.TYPE_EDITABLE = 2;
	return ContentAuthorized;
};