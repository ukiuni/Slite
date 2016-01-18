var EventEmitter = require('events').EventEmitter;
var packageInfo = require(__dirname + '/../package.json');
var ev = new EventEmitter();
var Account = global.db.Account;
var Bot = global.db.Bot;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Group = global.db.Group;
var Message = global.db.Message;
var AccountInGroup = global.db.AccountInGroup;
var AccountInChannel = global.db.AccountInChannel;
var Channel = global.db.Channel;
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var PRIVATE_ROOM_NAME_PREFIX = "accountId:";
var socketIO = function(io) {
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
				if (channel.GroupId && 0 != channel.GroupId) {
					return AccountInGroup.find({
						where : {
							AccountId : socket.client.accountId,
							GroupId : channel.GroupId,
							inviting : Group.INVITING_DONE
						}
					});
				} else {
					return AccountInChannel.find({
						where : {
							AccountId : socket.client.accountId,
							ChannelId : channel.id,
						// TODO inviting : AccountInChannel.INVITING_DONE
						}
					});
				}
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
			var idAfter = requestParam.idAfter;
			loadAccessibleChannel(channelAccessKey).then(function(channel) {
				var criteria = {
					where : {
						channelId : channel.id
					},
					include : [ {
						model : Account,
						as : "owner",
						attributes : [ "id", "name", "iconUrl" ]
					}, {
						model : Bot,
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
				if (idAfter) {
					if (!criteria.where.id) {
						criteria.where.id = {}
					}
					criteria.where.id["$gt"] = idAfter;
				}
				return Message.findAll(criteria);
			}).then(function(messages) {
				socket.emit(channelAccessKey, JSON.stringify({
					type : "historicalMessage",
					messages : messages,
					channelAccessKey : channelAccessKey
				}));
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
				socket.emit("authorized", account);
				socket.join(PRIVATE_ROOM_NAME_PREFIX + account.id);
			})["catch"](function(e) {
				if (e.stack) {
					console.log(e.stack);
				} else {
					console.log(e);
				}
				socket.emit("exception", e);
			});
		});
		socket.on("disconnect", function() {
			for ( var i in listenChannels) {
				self.sendReaveFromChannelEvent(i, socket.client.account);
			}
		});
		socket.on("pongListening", function(accessKey) {
			self.pongListening(socket.client.account, accessKey);
		})
		socket.emit("informVersion", {
			hostVersion : packageInfo.version
		});
	});
	self.sendToContent = function(contentKey, comment) {
		io.to(contentKey).emit(contentKey, JSON.stringify(comment));
	}
	self.sendEventToGroup = function(groupAccessKey, type, info) {
		io.to(groupAccessKey).emit(groupAccessKey, JSON.stringify({
			type : type,
			info : info
		}));
	}
	self.sendJoinEventToAdmin = function(adminAccount, group, account) {
		io.to(PRIVATE_ROOM_NAME_PREFIX + adminAccount.id).emit("event", {
			type : "join",
			info : {
				group : group,
				account : account
			}
		});
	}
	self.sendEventToAccount = function(accountId, type, info) {
		io.to(PRIVATE_ROOM_NAME_PREFIX + accountId).emit("event", {
			type : type,
			info : info
		});
	}
	self.sendRemindAppendedEventToAccount = function(accountId, time, message) {
		self.sendEventToAccount(accountId, "remindAppended", {
			time : time,
			message : message
		});
	}
	self.sendInvitationRequestEventToAccount = function(adminAccount, group, fromAccount) {
		io.to(PRIVATE_ROOM_NAME_PREFIX + adminAccount.id).emit("event", {
			type : "invitationRequest",
			info : {
				group : group,
				account : fromAccount
			}
		});
	}
	self.sendInvitationEvent = function(group, targetAccount) {
		io.to(PRIVATE_ROOM_NAME_PREFIX + targetAccount.id).emit("event", {
			type : "invited",
			info : {
				group : group
			}
		});
	}
	self.sendAppendsChannelEvent = function(targetAccountId, fromAccount, channel) {
		io.to(PRIVATE_ROOM_NAME_PREFIX + targetAccountId).emit("channelEvent", {
			type : "appendsChannel",
			info : {
				channel : channel,
				fromAccount : {
					id : fromAccount.id,
					name : fromAccount.name,
					iconUrl : fromAccount.iconUrl
				}
			}
		});
	}
	self.sendToChannel = function(channelAccessKey, message) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify({
			type : "message",
			message : message,
			channelAccessKey : channelAccessKey
		}));
	}
	self.sendAccountEvent = function(channelAccessKey, account, type) {
		io.to(channelAccessKey).emit(channelAccessKey, JSON.stringify({
			type : type,
			account : {
				id : account.id,
				name : account.name,
				iconUrl : account.iconUrl
			},
			channelAccessKey : channelAccessKey
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
	self.pingListening = function(accountId, accessKey, emitter) {
		ev.once(PRIVATE_ROOM_NAME_PREFIX + accountId + ":" + accessKey, function() {
			emitter();
		});
		io.to(PRIVATE_ROOM_NAME_PREFIX + accountId).emit("pingListening", accessKey);
	}
	self.stopPingListening = function(accountId, accessKey, emitter) {
		ev.removeListener(PRIVATE_ROOM_NAME_PREFIX + accountId + ":" + accessKey, emitter);
	}
	self.pongListening = function(account, accessKey) {
		ev.emit(PRIVATE_ROOM_NAME_PREFIX + account.id + ":" + accessKey, {
			account : account,
			accessKey : accessKey
		});
	}
	return self;
}
module.exports = socketIO;