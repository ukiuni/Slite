'use strict';
module.exports = {
	up : function(queryInterface, Sequelize) {
		return queryInterface.addColumn('Messages', 'BotId', Sequelize.BIGINT)
	},
	down : function(queryInterface, Sequelize) {
		return queryInterface.removeColumn('Messages', 'BotId')
	}
};
