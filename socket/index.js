var Account = global.db.Account;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var ContentAuthorized = global.db.ContentAuthorized;
var socket = function(io) {
	var connected;
	this.context = io.sockets.on('connection', function(socket) {
		connected = socket;
		socket.on('listenComment', function(contentKey) {
			Content.find({
				where : {
					accessKey : contentKey
				},
				include : [ {
					model : ContentBody,
					where : [ "'ContentBodies'.'version' = 'Content'.'currentVersion'" ],
					attributes : [ "status" ]
				} ]
			}).then(function(content) {
				if (ContentBody.STATUS_OPEN == content.ContentBodies[0].status || ContentBody.STATUS_URLACCESS == content.ContentBodies[0].status) {
					socket.join(contentKey);
				}
				ContentAuthorized.find({
					where : {
						ContentId : content.id,
						AccountId : socket.client.accountId
					}
				}).then(function(contentAuthorized) {
					if (contentAuthorized) {
						socket.join(contentKey);
					}
				});
			});
		});
		socket.on('unListenComment', function(contentKey) {
			socket.leave(contentKey);
		});
		socket.on('authorize', function(accessKey) {
			AccessKey.find({
				where : {
					secret : accessKey
				}
			}).then(function(accessKey) {
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
	return this;
}
module.exports = socket;