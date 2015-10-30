module.exports = function(sequelize, DataTypes) {
	var Content = sequelize.define("Content", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		currentVersion : DataTypes.INTEGER,
		language : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			isAccessible : function(accountId) {
				return global.db.AccountInGroup.find({
					where : {
						ContentId : this.GroupId,
						AccountId : accountId
					}
				});
			}
		},
		indexes : [ {
			fields : [ "accessKey", "deletedAt" ]
		} ]
	});
	Content.associate = function(sequelize) {
		Content.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Content.hasMany(sequelize.ContentBody);
		Content.hasMany(sequelize.ContentComment, {
			as : "comment"
		});
		Content.hasMany(sequelize.ContentComment, {
			as : "comment"
		});
		Content.belongsToMany(sequelize.Tag, {
			through : sequelize.ContentToTag
		});
		Content.belongsTo(sequelize.Group);
	}
	return Content;
};