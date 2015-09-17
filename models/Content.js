module.exports = function(sequelize, DataTypes) {
	var Content = sequelize.define("Content", {
		accessKey : DataTypes.TEXT,
		currentVersion : DataTypes.INTEGER
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			isAccessible : function(accountId) {
				return sequelize.ContentAuthorized.find({
					where : {
						ContentId : this.id,
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
	}
	return Content;
};