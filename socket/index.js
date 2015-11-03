var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var AccountInGroup = global.db.AccountInGroup;
var Channel = global.db.Channel;
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var socket = function(io) {
	var connected;
	this.context = io.sockets.on('connection', function(socket) {
		connected = socket;
		socket.on('listenComment', function(contentKey) {
			Content.findAll({
				where : {
					accessKey : contentKey
				},
				include : [ {
					model : ContentBody,
					where : [ "\"ContentBodies\".\"version\" = \"Content\".\"currentVersion\"" ],
					attributes : [ "status", "version" ]
				} ]
			}).then(function(contents) {
				var content = contents[0];
				if (ContentBody.STATUS_OPEN == content.ContentBodies[0].status || ContentBody.STATUS_URLACCESS == content.ContentBodies[0].status) {
					socket.join(contentKey);
				} else if (ContentBody.STATUS_AUTHENTICATEDONLY == content.ContentBodies[0].status) {
					AccountInGroup.find({
						where : {
							AccountId : socket.client.accountId,
							GroupId : content.GroupId,
							inviting : Group.INVITING_DONE
						}
					}).then(function(accountInGroup) {
						if (accountInGroup) {
							socket.join(contentKey);
						} else {
							// TODO send error
						}
					});
				} else if (content.ownerId == socket.client.accountId) {
					socket.join(contentKey);
				} else {
					// TODO send error
				}
			});
		});
		socket.on('unListenComment', function(contentKey) {
			socket.leave(contentKey);
		});
		socket.on('listenChannel', function(channelAccessKey) {
			Channel.find({
				where : {
					accessKey : channelAccessKey
				}
			}).then(function(channel) {
				if (!channel) {
					throw ERROR_NOTACCESSIBLE;
				}
				return AccountInGroup.find({
					where : {
						AccountId : socket.client.accountId,
						GroupId : channel.GroupId,
						inviting : Group.INVITING_DONE
					}
				});
			}).then(function(accountInGroup) {
				if (accountInGroup) {
					socket.join(channelAccessKey);
				} else {
					// TODO send error
				}
			})["catch"](function(e) {
				// TODO send error
			});
		});
		socket.on('unListenChannel', function(groupAccessKey) {
			socket.leave(groupAccessKey);
		});
		socket.on('authorize', function(accessKey) {
			AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
				if (!accessKey) {
					return;
				}
				socket.client.accountId = accessKey.AccountId;
			})
		});
	});
	this.sendToContent = function(contentKey, comment) {
		io.to(contentKey).emit(contentKey, JSON.stringify(comment));
	}
	this.sendToChannel = function(channelAccessKey, message) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify(message));
	}
	return this;
}
module.exports = socket;