module.exports = function(sequelize, DataTypes) {
	var Content = sequelize.define("Content", {
		accessKey : DataTypes.TEXT,
		type : DataTypes.TEXT,
		currentVersion : DataTypes.INTEGER
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
		}
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