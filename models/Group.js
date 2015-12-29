module.exports = function(sequelize, DataTypes) {
	var Group = sequelize.define("Group", {
		name : {
			type : DataTypes.TEXT
		},
		imageUrl : DataTypes.TEXT,
		description : DataTypes.TEXT,
		visibility : DataTypes.INTEGER,
		accessKey : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "groupName",
			fields : [ "name" ]
		}, {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	Group.associate = function(sequelize) {
		Group.hasMany(sequelize.Content);
		Group.hasMany(sequelize.Channel);
		Group.belongsToMany(sequelize.Account, {
			through : sequelize.AccountInGroup
		});
		Group.hasMany(sequelize.AccountConfig);
	}
	Group.VISIBILITY_OPEN = 1;
	Group.VISIBILITY_SECRET = 2;
	Group.VISIBILITY_SECRET_EVEN_MEMBER = 3;
	Group.INVITING_START = 1;
	Group.INVITING_REQUESTED = 2;
	Group.INVITING_DONE = 3;
	Group.INVITING_REJECTED = 4;
	return Group;
};