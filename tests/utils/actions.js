var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../../config/server.json")[env];
var url = serverConfig.hostURL;
var testWaitTime = 10000;
var self = {
	signout : function(client) {
		client.click('a.dropdown-toggle');
		client.waitForElementVisible('#signoutButton', testWaitTime);
		client.click('#signoutButton');
		client.waitForElementVisible('#createAccountButton', testWaitTime);
		client.assert.containsText("h1", "Signout");
		client.pause(1000)
	},
	createAccountAndSignin : function(client, account) {
		if (!account) {
			var accountRandom = new Date().getTime();
			account = {
				name : 'testAccount' + accountRandom,
				mail : 'testAccount' + accountRandom + "@example.com",
				password : accountRandom
			}
		}
		client.url(url);
		client.pause(1000);
		client.url(url);
		client.waitForElementVisible('#createAccountButton', testWaitTime);
		client.assert.visible('#createAccountButton');
		client.click('#createAccountButton');
		client.waitForElementVisible('.modal-dialog', testWaitTime);
		client.assert.visible('#inputName').assert.visible("#inputMail").assert.visible("#inputPassword");
		client.setValue('#inputName', account.name);
		client.setValue('#inputMail', account.mail);
		client.setValue('#inputPassword', account.password);
		client.click('#saveButton');
		client.waitForElementVisible('button[type=submit]', testWaitTime);
		client.assert.visible('#inputMail').assert.visible("#inputMail");
		client.setValue('#inputMail', account.mail);
		client.setValue('#inputPassword', account.password);
		client.click('#signinButton');
		client.waitForElementVisible('#groupArea', testWaitTime);
		client.assert.containsText("p", "Hi");
		return account;
	},
	joinToFirstGroupWhenSignin : function(client) {
		client.click('#groupArea > div > div > a');
		client.waitForElementVisible("#joinButton", testWaitTime);
		client.assert.attributeContains("#memberArea > div:last-child > div:last-child > img", "src", "inviting.png");
		client.click('#joinButton');
		client.pause(1000);
		client.assert.attributeContains("#memberArea > div:last-child > div:last-child > img", "src", "viewer.png");
	},
	createContentAndCheckExists : function(client, done) {
		var contentRandom = new Date().getTime();
		var contentTitle = "contentTitle" + contentRandom;
		var tags = "contentTag1" + contentRandom + "," + "contentTag2" + contentRandom + ",JavaScript";
		var article = "article" + contentRandom;
		client.url(url + "/editContent");
		client.waitForElementVisible('#userNameInMenu', testWaitTime);
		client.click('#userNameInMenu');
		client.waitForElementVisible('#toEditContentLink', testWaitTime);
		client.click('#toEditContentLink');
		client.waitForElementVisible('#contentTitle', testWaitTime);
		client.setValue('#contentTitle', contentTitle);
		client.setValue('tags-input > div > div > input', tags);
		client.setValue('#article', article);
		client.click('select');
		client.waitForElementVisible('option:first-child', testWaitTime);
		client.click('option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click('.btn-primary');
		client.waitForElementVisible(".contentListColmun", testWaitTime);
		client.assert.containsText("div > div > a > span", contentTitle);
		client.getAttribute(".contentListTitle", "href", function(result) {
			client.click("div > div > a > span");
			client.waitForElementVisible(".contentTitle", testWaitTime);
			client.pause(1000);
			client.assert.containsText(".contentTitle", contentTitle);
			client.assert.containsText("#tags > li:first-child", tags.split(",")[0]);
			client.assert.containsText("div > div > div > p", article);
			if (done) {
				done(result.value, {
					title : contentTitle,
					article : article,
					tags : tags
				});
			}
		});
	},
	updateContentAndCheckUpdated : function(client, done) {
		var contentRandom = new Date().getTime();
		var contentTitle = "contentTitle_updated" + contentRandom;
		var tags = "contentTag1U" + contentRandom + "," + "contentTag2U" + contentRandom + ",JavaScript";
		var article = "article_updated" + contentRandom;
		client.url(url + "/home");
		client.waitForElementVisible('.contentListColmun', testWaitTime);
		client.click('.editButton');
		client.waitForElementVisible('#contentTitle', testWaitTime);
		client.pause(5000);
		client.setValue('#contentTitle', contentTitle);
		client.setValue('tags-input > div > div > input', tags);
		client.setValue('#article', article);
		client.click('select');
		client.waitForElementVisible('option:first-child', testWaitTime);
		client.click('option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click('.btn-primary');
		client.waitForElementVisible(".contentListColmun", testWaitTime);
		client.assert.containsText("div > div > a > span", contentTitle);
		client.getAttribute(".contentListTitle", "href", function(result) {
			client.click("div > div > a > span");
			client.waitForElementVisible(".contentTitle", testWaitTime);
			client.pause(1000);
			client.assert.containsText(".contentTitle", contentTitle);
			// TODO tag-input is difficult to test
			// client.assert.containsText("#tags > li:first-child",
			// tags.split(",")[0]);
			client.assert.containsText("div > div > div > p", article);
			if (done) {
				done(result.value);
			}
		});
	},
	deleteContentAndCheckDeleted : function(client, content, done) {
		client.url(url + "/home");
		client.waitForElementVisible('.contentListColmun', testWaitTime);
		client.waitForElementVisible('.deleteButton', testWaitTime);
		client.pause(1000);
		client.click('.deleteButton');
		client.waitForElementVisible('#confirmDialog', testWaitTime);
		client.click('#deleteButton');
		client.assert.elementNotPresent('.contentListTitle');
		if (done) {
			done();
		}
	},
	createContentAndCheckExistsAndComment : function(client, contentUrl, comment) {
		var contentRandom = new Date().getTime();
		var contentComment = "contentComment" + contentRandom;
		var article = "article" + contentRandom;
		client.url(contentUrl);
		client.waitForElementVisible('textarea', testWaitTime);
		client.setValue('textarea', contentComment);
		client.click('.btn-primary');
		client.waitForElementVisible(".commentName", testWaitTime);
		client.assert.containsText(".commentName", comment.account.name);
		client.assert.containsText(".commentMessage", contentComment);
	},
	rewriteTagDescriptionAndCheckExists : function(client, contentUrl, comment) {
		var contentRandom = new Date().getTime();
		var tagDescription = "contentComment" + contentRandom;
		client.url(contentUrl);
		client.waitForElementVisible('#tagArea', testWaitTime);
		client.click('#tagArea > ul > li > a');
		client.waitForElementVisible("#editButton", testWaitTime);
		client.click('#editButton');
		client.waitForElementVisible('#saveButton', testWaitTime);
		client.waitForElementVisible('textarea', testWaitTime);
		client.setValue('textarea', tagDescription);
		client.click('#saveButton');
		client.waitForElementVisible('#descriptionArea', testWaitTime);
		client.assert.containsText("#descriptionArea", tagDescription);
	},
	createGroupAndCheckExists : function(client, callback, openStatusCursor) {
		var contentRandom = new Date().getTime();
		var groupName = "groupName" + contentRandom;
		var groupDescription = "groupDescription" + contentRandom;
		client.url(url + "/groups");
		client.waitForElementVisible('#createNewGroupButton', testWaitTime);
		client.click('#createNewGroupButton');
		client.waitForElementVisible("#saveButton", testWaitTime);
		client.setValue('input', groupName);
		client.setValue('textarea', groupDescription);
		client.click('select');
		client.waitForElementVisible('option:first-child', testWaitTime);
		client.click(openStatusCursor ? openStatusCursor : 'option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click('#saveButton');
		client.waitForElementVisible('div#groupName', testWaitTime);
		client.assert.containsText("#groupName", groupName);
		client.assert.containsText("#groupDescription", groupDescription);
		if (callback) {
			client.getAttribute("#toMessage", "href", function(result) {
				callback(groupName, result.value.match(/(http:\/\/[^\/]+\/[^\/]+\/[^\/]+)/)[1])
			});
		}
	},
	sendMessage : function(client, groupName, groupUrl, callback) {
		var contentRandom = new Date().getTime();
		var message = "message" + contentRandom;
		client.url(groupUrl);
		client.waitForElementVisible('#groupName', testWaitTime);
		client.click("#toMessage");
		client.waitForElementVisible('#messageScrollPane', testWaitTime);
		client.setValue('textarea', message);
		client.sendKeys('textarea', client.Keys.ENTER);
		client.pause(1000);
		client.assert.containsText("#messageScrollInner", message);
		client.getAttribute("a", "href", function(result) {
			client.url(groupUrl);
			var ApiActions = require(__dirname + "/apiActions");
			ApiActions.createAccount(client.assert, function(account) {
				client.url(groupUrl);
				client.getAttribute("a", "href", function(result) {
					client.url(groupUrl);
					var accountName = account.name;
					account.name = account.mail;// For not joining user;
					self.inviteAccountAfterCreateGroupAndCheckExists(client, account, function() {
						account.name = accountName;
						client.url(groupUrl);
						client.waitForElementVisible('#groupName', testWaitTime);
						client.click("#toMessage");
						client.waitForElementVisible('#messageScrollPane', testWaitTime);
						client.getAttribute("a", "href", function(result) {
							client.pause(10000);// For avoid automatically-close
							ApiActions.signin(client.assert, account, function(sessionKey) {
								var groupAccessKey = groupUrl.match(/group\/([^\/]+)/)[1];
								ApiActions.joinToGroup(client.assert, sessionKey, groupAccessKey, function() {
									var secondMessage = "secondMessage" + contentRandom;
									ApiActions.sendMessage(client.assert, sessionKey, groupAccessKey, secondMessage, function() {
										client.pause(1000);
										client.assert.containsText("#messageScrollInner", secondMessage, "Second Message has comen.");
										if (callback) {
											callback();
										}
									});
								});
							});
						});
					});
				});
			});
		});
	},
	inviteAccountAfterCreateGroupAndCheckExists : function(client, account, callback) {
		client.setValue('input', account.mail);
		client.click('select');
		client.waitForElementVisible('option:first-child', testWaitTime);
		client.click('option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click("#inviteButton");
		client.pause(1000);
		client.assert.containsText("#memberArea", account.name);
		if (callback) {
			client.getAttribute("a", "href", function(result) {
				callback();
			});
		}
	},
	visitGroupAndNotVisible : function(client, groupUrl) {
		client.url(groupUrl);
		client.waitForElementVisible('#groupListLink', testWaitTime);
		client.expect.element('#groupName').to.not.be.visible;
	}
}
module.exports = self;