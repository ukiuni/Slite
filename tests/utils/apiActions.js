var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var url = serverConfig.hostURL;
var request = require("request");
module.exports = {
	createAccount : function(assert, done) {
		var contentRandom = new Date().getTime();
		var name = "name" + contentRandom;
		var mail = "test" + contentRandom + "@example.com";
		var password = contentRandom;
		request.post({
			uri : url + "/api/accounts",
			form : {
				name : name,
				mail : mail,
				password : password
			},
			json : true
		}, function(error, res, body) {
			assert.equal(false, !!error);
			assert.equal(res.statusCode, 201);
			assert.equal(body.name, name);
			assert.equal(body.mail, mail);
			assert.equal(!!body.iconUrl, true);
			assert.equal(!!body.activationUrl, true);
			if (done) {
				body.password = password;
				done(body);
			}
		});
	},
	signin : function(assert, account, done) {
		request.get({
			uri : url + "/api/accounts/signin",
			qs : {
				mail : account.mail,
				password : account.password
			},
			json : true
		}, function(error, res, body) {
			assert.equal(!!error, false);
			assert.equal(res.statusCode, 200);
			assert.equal(body.account.name, account.name);
			assert.equal(body.account.mail, account.mail);
			assert.equal(!!body.sessionKey.secret, true);
			if (done) {
				done(body.sessionKey.secret);
			}
		});
	},
	createContent : function(assert, sessionKey, done) {
		var contentRandom = new Date().getTime();
		var contentTitle = "contentTitle" + contentRandom;
		var article = "article" + contentRandom + "\n## test";
		var tags = "tags" + contentRandom + ", JavaScript";
		var topImageUrl = "topImageUrl" + contentRandom;
		var status = 2;
		request.post({
			uri : url + "/api/contents",
			form : {
				title : contentTitle,
				article : article,
				topImageUrl : topImageUrl,
				status : status,
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			assert.equal(false, !!error);
			assert.equal(res.statusCode, 201);
			assert.equal(!!body.accessKey, true);
			if (done) {
				done({
					title : contentTitle,
					article : article,
					tags : tags,
					topImageUrl : topImageUrl,
					status : status,
					accessKey : body.accessKey
				});
			}
		});
	},
	getContent : function(assert, sessionKey, content, done) {
		request.get({
			uri : url + "/api/contents/" + content.accessKey,
			qs : {
				accessKey : content.accessKey,
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			assert.equal(false, !!error);
			assert.equal(res.statusCode, 200);
			assert.equal(body.accessKey, content.accessKey);
			assert.equal(body.ContentBodies[0].title, content.title);
			assert.equal(body.ContentBodies[0].article, content.article);
			assert.equal(body.ContentBodies[0].status, content.status);
			if (done) {
				done(content);
			}
		});
	},
	updateContent : function(assert, sessionKey, content, done) {
		this.updateContentWithAppends(assert, sessionKey, content, null, done);
	},
	updateContentWithAppends : function(assert, sessionKey, content, appends, done) {
		var contentRandom = new Date().getTime();
		var contentTitle = "contentTitle" + contentRandom;
		var article = "articleUpdated" + contentRandom + "\n## test";
		var tags = "tagsUpdated" + contentRandom + ", JavaScript";
		var topImageUrl = "topImageUrlUpdated" + contentRandom;
		var status = 1;
		request.put({
			uri : url + "/api/contents/" + content.accessKey,
			form : {
				title : contentTitle,
				article : article,
				topImageUrl : topImageUrl,
				status : status,
				appends : appends,
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			assert.equal(false, !!error);
			assert.equal(res.statusCode, 201);
			assert.equal(!!body.accessKey, true);
			if (done) {
				var newArticle = article;
				if ("before" == appends) {
					newArticle = article + content.article;
				} else if ("after" == appends) {
					newArticle = content.article + article;
				}
				done({
					title : contentTitle,
					article : newArticle,
					tags : tags,
					topImageUrl : topImageUrl,
					status : status,
					accessKey : body.accessKey
				});
			}
		});
	},
	updateContentWithAppendsOnlyArticle : function(assert, sessionKey, content, appends, done) {
		var contentRandom = new Date().getTime();
		var article = "articleUpdated" + contentRandom + "\n## test";
		request.put({
			uri : url + "/api/contents/" + content.accessKey,
			form : {
				article : article,
				appends : appends,
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			var newArticle = article;
			if ("before" == appends) {
				newArticle = article + content.article;
			} else if ("after" == appends) {
				newArticle = content.article + article;
			}
			assert.equal(!!error, false);
			assert.equal(res.statusCode, 201);
			assert.equal(body.accessKey, content.accessKey);
			assert.equal(content.title, body.ContentBodies[0].title);
			assert.equal(newArticle, body.ContentBodies[0].article);
			assert.equal(content.topImageUrl, body.ContentBodies[0].topImageUrl);
			assert.equal(content.status, body.ContentBodies[0].status);
			// TODO tags test is difficult now
			// assert.equal(content.tags, body.tags);
			if (done) {
				done({
					title : content.title,
					article : newArticle,
					tags : content.tags,
					topImageUrl : content.topImageUrl,
					status : content.status,
					accessKey : content.accessKey
				});
			}
		});
	},
	sendMessage : function(assert, sessionKey, groupAccessKey, channelAccessKey, message, callback) {
		request.post({
			uri : url + "/api/groups/" + groupAccessKey + "/channels/" + channelAccessKey + "/messages",
			form : {
				body : message,
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			assert.equal(!!error, false, "Send message no error");
			assert.equal(res.statusCode, 201, "Send message status");
			if (callback) {
				callback();
			}
		});
	},
	joinToGroup : function(assert, sessionKey, groupAccessKey, callback) {
		request.put({
			uri : url + "/api/groups/" + groupAccessKey + "/join",
			form : {
				sessionKey : sessionKey
			},
			json : true
		}, function(error, res, body) {
			assert.equal(!!error, false);
			assert.equal(res.statusCode, 200, "JOIN to group");
			if (callback) {
				callback();
			}
		});
	}
}