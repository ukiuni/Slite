var Random = require(__dirname + "/../util/random");
var Promise = require("bluebird");
module.exports = function(sequelize, DataTypes) {
	var TimerTask = sequelize.define("TimerTask", {
		targetDate : DataTypes.DATE,
		config : DataTypes.TEXT,
		type : DataTypes.TEXT,
		repeatType : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			execute : function() {
				self = this;
				return new Promise(function(success, fail) {
					if (TimerTask.TYPE_REMIND == self.type) {
						var config = JSON.parse(self.config);
						var loadedAccount;
						var loadedChannel;
						console.log("---------config.ownerId--- "+config.ownerId);
						global.db.Channel.findById(config.channelId).then(function(channel) {
							loadedChannel = channel
							return global.db.Account.findById(config.ownerId);
						}).then(function(account) {
							loadedAccount = account;
							return Random.createRandomBase62();
						}).then(function(random) {
							return global.db.Message.create({
								body : config.message,
								ownerId : loadedAccount.id,
								channelId : loadedChannel.id,
								accessKey : random,
								type : global.db.Message.TYPE_REMIND
							});
						}).then(function(message) {
							message.dataValues.owner = loadedAccount;
							message.owner = loadedAccount;
							socket.sendToChannel(loadedChannel.accessKey, message);
							global.db.NotificationTarget.notifyToChannel(loadedChannel, message);
							success(message);
						})["catch"](function(error) {
							fail(error);
						});
					} else {
						fail("no type specified " + self.type);
					}
				})
			}
		},
		indexes : [ {
			fields : [ "targetDate", "deletedAt" ]
		} ]
	});
	TimerTask.associate = function(sequelize) {
		TimerTask.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		TimerTask.belongsTo(sequelize.Bot);
		TimerTask.belongsTo(sequelize.Channel, {
			as : 'channel'
		});
	}
	TimerTask.TYPE_REMIND = "remind";
	TimerTask.REPEAT_TYPE_NONE = "none";
	return TimerTask;
};