module.exports = function(sequelize, DataTypes) {
	var Group = sequelize.define("Group", {
		name : {
			type : DataTypes.TEXT,
			unique : true
		},
		imageUrl : DataTypes.TEXT,
		description : DataTypes.TEXT,
		visibility : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "groupName",
			fields : [ "name" ]
		} ]
	});
	Group.associate = function(sequelize) {
		Group.belongsToMany(sequelize.Content, {
			through : sequelize.ContentInGroup
		});
		Group.belongsToMany(sequelize.Account, {
			through : sequelize.AccountInGroup
		});
	}
	Group.VISIBILITY_OPEN = 1;
	Group.VISIBILITY_SECRET = 2;
	Group.VISIBILITY_SECRET_EVEN_MEMBER = 3;
	Group.INVITING_START = 1;
	Group.INVITING_DONE = 2;
	Group.INVITING_REJECT = 3;
	return Group;
};