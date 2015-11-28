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
							socket.emit("exception", ERROR_NOTACCESSIBLE);
						}
					});
				} else if (content.ownerId == socket.client.accountId) {
					socket.join(contentKey);
				} else {
					socket.emit("exception", ERROR_NOTACCESSIBLE);
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
		var listenChannels = [];
		socket.on('listenChannel', function(channelAccessKey) {
			loadAccessibleChannel(channelAccessKey).then(function(channel) {
				if (channel) {
					socket.join(channelAccessKey);
					listenChannels[channelAccessKey] = channelAccessKey;
					self.sendJoinToChannelEvent(channelAccessKey, socket.client.account);
				} else {
					throw ERROR_NOTACCESSIBLE;
				}
			})["catch"](function(e) {
				console.log(e);
				socket.emit("exception", e);
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
					socket.emit(channelAccessKey, JSON.stringify({
						type : "historicalMessage",
						message : message
					}));
				});
			})["catch"](function(e) {
				console.log(e.stack);
				socket.emit("exception", e);
			});
		});
		socket.on('hello', function(requestParam) {
			requestParam = JSON.parse(requestParam);
			var channelAccessKey = requestParam.channelAccessKey;
			self.sendHello(channelAccessKey, socket.client.account);
		});
		socket.on('unListenChannel', function(channelAccessKey) {
			socket.leave(channelAccessKey);
			self.sendReaveFromChannelEvent(channelAccessKey, socket.client.account);
			delete listenChannels[channelAccessKey];
		});
		socket.on('authorize', function(accessKey) {
			AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
				if (!accessKey) {
					throw ERROR_NOTACCESSIBLE;
				}
				return Account.findById(accessKey.AccountId);
			}).then(function(account) {
				if (!account) {
					throw ERROR_NOTACCESSIBLE;
				}
				socket.client.accountId = account.id;
				socket.client.account = account;
			})["catch"](function(e) {
				if (e.stack) {
					console.log(e.stack);
				} else {
					console.log(e);
				}
				// TODO send error
			});
		});
		socket.on("disconnect", function() {
			for ( var i in listenChannels) {
				self.sendReaveFromChannelEvent(i, socket.client.account);
			}
		});
	});
	self.sendToContent = function(contentKey, comment) {
		io.to(contentKey).emit(contentKey, JSON.stringify(comment));
	}
	self.sendToChannel = function(channelAccessKey, message) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify({
			type : "message",
			message : message
		}));
	}
	self.sendAccountEvent = function(channelAccessKey, account, type) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify({
			type : type,
			account : {
				id : account.id,
				name : account.name,
				iconUrl : account.iconUrl
			}
		}));
	}
	self.sendJoinToChannelEvent = function(channelAccessKey, account) {
		self.sendAccountEvent(channelAccessKey, account, "join");
	}
	self.sendHello = function(channelAccessKey, account) {
		self.sendAccountEvent(channelAccessKey, account, "hello");
	}
	self.sendReaveFromChannelEvent = function(channelAccessKey, account) {
		self.sendAccountEvent(channelAccessKey, account, "reave");
	}
	return self;
}
module.exports = socket;