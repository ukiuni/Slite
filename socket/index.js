var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var Message = global.db.Message;
var AccountInGroup = global.db.AccountInGroup;
var Channel = global.db.Channel;
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var socket = function(io) {
	var connected;
	var self = this;
	self.context = io.sockets.on('connection', function(socket) {
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
		var loadAccessibleChannel = function(channelAccessKey) {
			var loadedChannel;
			return Channel.find({
				where : {
					accessKey : channelAccessKey
				}
			}).then(function(channel) {
				if (!channel) {
					throw ERROR_NOTACCESSIBLE;
				}
				loadedChannel = channel;
				return AccountInGroup.find({
					where : {
						AccountId : socket.client.accountId,
						GroupId : channel.GroupId,
						inviting : Group.INVITING_DONE
					}
				});
			}).then(function(accountInGroup) {
				if (!accountInGroup) {
					throw ERROR_NOTACCESSIBLE;
				}
				return new Promise(function(success) {
					success(loadedChannel)
				});
			});
		}
		socket.on('listenChannel', function(channelAccessKey) {
			loadAccessibleChannel(channelAccessKey).then(function(channel) {
				if (channel) {
					socket.join(channelAccessKey);
				} else {
					throw ERROR_NOTACCESSIBLE;
				}
			})["catch"](function(e) {
				// TODO send error
			});
		});
		socket.on('requestMessage', function(requestParam) {
			requestParam = JSON.parse(requestParam);
			var channelAccessKey = requestParam.channelAccessKey;
			var limit = requestParam.limit || 10;
			var idBefore = requestParam.idBefore;
			loadAccessibleChannel(channelAccessKey).then(function(channel) {
				var criteria = {
					where : {
						channelId : channel.id
					},
					include : [ {
						model : Account,
						as : "owner",
						attributes : [ "id", "name", "iconUrl" ]
					} ],
					order : [ [ 'id', 'DESC' ] ],
					limit : limit
				}
				if (idBefore) {
					criteria.where.id = {
						$lt : idBefore
					}
				}
				return Message.findAll(criteria);
			}).then(function(messages) {
				messages.reverse().forEach(function(message) {
					socket.emit(channelAccessKey, JSON.stringify(message));
				});
			})["catch"](function(e) {
				console.log(e.stack);
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
	self.sendToContent = function(contentKey, comment) {
		io.to(contentKey).emit(contentKey, JSON.stringify(comment));
	}
	self.sendToChannel = function(channelAccessKey, message) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify(message));
	}
	return self;
}
module.exports = socket;