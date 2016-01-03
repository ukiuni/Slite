var Random = require(__dirname + "/../util/random");
var renderer = require('ect')({
	root : './res/template'
});
module.exports = function(sequelize, DataTypes) {
	var Bot = sequelize.define("Bot", {
		key : DataTypes.TEXT,
		name : DataTypes.TEXT,
		iconUrl : DataTypes.TEXT,
		description : DataTypes.TEXT,
		type : DataTypes.INTEGER,
		extend : DataTypes.TEXT
	}, {
		paranoid : true,
		classMethods : {},
		instanceMethods : {
			handleGitrabRequest : function(json) {
				var event = json.object_kind;
				var author = json.user_name;
				var url = json.repository.homepage;
				var repositoryName = json.repository.name;
				var message = json.message;
				var messageBodyData = {
					event : event,
					author : author,
					repositoryName : repositoryName,
					url : url,
					message : message
				};
				if (json.object_attributes) {
					messageBodyData.title = json.object_attributes.title;
					messageBodyData.description = json.object_attributes.description;
					messageBodyData.url = json.object_attributes.url;
				}
				var messageBody = renderer.render("gitlabWebhookMessage.ect", messageBodyData);
				var self = this;
				Random.createRandomBase62().then(function(random) {
					return global.db.Message.create({
						body : messageBody,
						ownerId : self.owner.id,
						BotId : self.id,
						channelId : self.Channel.id,
						accessKey : random,
						type : global.db.Message.TYPE_MARKDOWN
					});
				}).then(function(message) {
					message.dataValues.owner = self.owner;
					message.owner = self.owner;
					var botdata = {
						id : self.id,
						name : self.name,
						iconUrl : self.iconUrl
					}
					message.dataValues.Bot = botdata
					message.Bot = botdata;
					global.socket.sendToChannel(self.Channel.accessKey, message);
					global.db.NotificationTarget.notifyToChannel(self.Channel, message);
					return new Promise(function(success) {
						success(message);
					})
				});
			}
		},
		indexes : [ {
			fields : [ "id", "ownerId", "type" ]
		} ]
	});
	Bot.associate = function(sequelize) {
		Bot.belongsTo(sequelize.Account, {
			as : 'owner'
		});
		Bot.belongsTo(sequelize.Channel);
		Bot.belongsTo(sequelize.Group);
	}
	Bot.findForSendMessage = function(key) {
		return Bot.find({
			where : {
				key : key
			},
			include : [ {
				model : global.db.Channel
			}, {
				model : global.db.Account,
				as : "owner",
				attribute : [ "id", "name", "iconUrl" ]
			} ]
		});
	}
	Bot.TYPE_GITLAB = "gitlab";
	return Bot;
};