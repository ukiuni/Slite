'use strict';
module.exports = {
	up : function(queryInterface, Sequelize) {
		queryInterface.addColumn('Accounts', 'private', {
			type : Sequelize.BOOLEAN,
			defaultValue : true
		})
	},
	down : function(queryInterface, Sequelize) {
		queryInterface.removeColumn('Accounts', 'private')
	}
};
