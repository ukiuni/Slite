var ERROR_NOTFOUND = "ERROR_NOTFOUND";
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
			sendMessage : function(channel, messageBody) {
				var self = this;
				return Random.createRandomBase62().then(function(random) {
					return global.db.Message.create({
						body : messageBody,
						ownerId : self.owner.id,
						BotId : self.id,
						channelId : channel.id,
						accessKey : random,
						type : global.db.Message.TYPE_MARKDOWN
					});
				}).then(function(message) {
					var account = global.db.Account.sanitize(self.owner);
					message.dataValues.owner = account;
					message.owner = account;
					var botdata = {
						id : self.id,
						name : self.name,
						iconUrl : self.iconUrl
					}
					message.dataValues.Bot = botdata
					message.Bot = botdata;
					global.socket.sendToChannel(channel.accessKey, message);
					global.db.NotificationTarget.notifyToChannel(channel, message);
					return new Promise(function(success) {
						success(message);
					})
				});
			},
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
						author = json.sender.login
					} else if (json.pusher) {
						author = json.pusher.name
					}
					var repositoryName = json.repository.name;
					var message = json.message;
					if (json.issue) {
						url = json.issue.url;
					} else if (json.compare) {
						url = json.compare;
					} else if (json.pull_request) {
						url = json.pull_request.url;
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
				return sendMessage(this.Channel, messageBody);
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
	Bot.findForSendMessageTypeAPI = function(key) {
		return Bot.findForSendMessage(key, Bot.TYPE_API);
	}
	Bot.findForSendMessage = function(key, type) {
		if (!key) {
			throw ERROR_NOTFOUND;
		}
		var query = {
			key : key
		}
		if (type) {
			query.type = type;
		}
		return Bot.find({
			where : query,
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
	Bot.TYPE_API = 99;
	return Bot;
};