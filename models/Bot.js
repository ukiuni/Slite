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
			handleWebhookRequest : function(type, json) {
				if (Bot.TYPE_GITLAB == type) {
					var event = json.object_kind;
					var author = json.user_name;
					var url = json.repository.homepage;
					var repositoryName = json.repository.name;
					var message = json.message;
					if (json.object_attributes) {
						var title = json.object_attributes.title;
						var description = json.object_attributes.description;
						url = json.object_attributes.url;
					}
				} else {
					var event = json.event;
					var author;
					if (json.pusher) {
						author = json.pusher.name;
					} else if (json.sender) {
						author = json.sender
					}
					var repositoryName = json.repository.name;
					var message = json.message;
					if (json.issue) {
						url = json.issue.url;
					} else if (json.compare) {
						url = json.compare;
					} else if (json.compare) {
						url = json.compare;
					} else {
						url = json.repository.url
					}
				}
				var messageBodyData = {
					event : event,
					author : author,
					repositoryName : repositoryName,
					url : url,
					message : message,
					title : title,
					description : description
				};
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
	Bot.TYPE_GITLAB = 1;
	Bot.TYPE_GITHUB = 2;
	return Bot;
};