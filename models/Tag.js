module.exports = function(sequelize, DataTypes) {
	var Tag = sequelize.define("Tag", {
		name : {
			type : DataTypes.TEXT,
			unique : true
		},
		imageUrl : DataTypes.TEXT,
		description : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		indexes : [ {
			name : "tagName",
			fields : [ "name" ]
		} ]
	});
	Tag.associate = function(sequelize) {
		Tag.belongsToMany(sequelize.Content, {
			through : sequelize.ContentToTag
		});
		Tag.belongsTo(sequelize.Account, {
			as : 'updator'
		});
	}
	return Tag;
};