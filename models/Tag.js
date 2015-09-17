module.exports = function(sequelize, DataTypes) {
	var Tag = sequelize.define("Tag", {
		name : {
			type : DataTypes.TEXT,
			imageUrl : DataTypes.TEXT,
			description : DataTypes.TEXT,
			unique : true
		}
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
	}
	return Tag;
};