module.exports = function(sequelize, DataTypes) {
	var AccountInGroup = sequelize.define('AccountInGroup', {
		authorization : DataTypes.INTEGER,
		inviting : DataTypes.INTEGER
	})
	AccountInGroup.associate = function(sequelize) {
		AccountInGroup.hasOne(sequelize.Account, {
			foreignKey : "invitor"
		});
	};
	return AccountInGroup;
}
