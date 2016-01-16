module.exports = function(sequelize, DataTypes) {
	var AccountInChannel = sequelize.define('AccountInChannel', {
		authorization : DataTypes.INTEGER,
		inviting : DataTypes.INTEGER,
		type : DataTypes.INTEGER
	}, {
		paranoid : true
	})
	AccountInChannel.associate = function(sequelize) {
		AccountInChannel.belongsTo(sequelize.Account, {
			foreignKey : "owner"
		});
	};
	AccountInChannel.TYPE_JOIN = 1;
	AccountInChannel.TYPE_REAVE = 2;
	AccountInChannel.INVITING_START = 1;
	AccountInChannel.INVITING_REQUESTED = 2;
	AccountInChannel.INVITING_DONE = 3;
	AccountInChannel.INVITING_REJECTED = 4;
	return AccountInChannel;
}
