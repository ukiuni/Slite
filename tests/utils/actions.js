var url = 'http://localhost:3030';
module.exports = {
	signout : function(client) {
		client.click('a.dropdown-toggle');
		client.waitForElementVisible('#signoutButton', 1000);
		client.click('#signoutButton');
		client.waitForElementVisible('#createAccountButton', 1000);
		client.assert.containsText("h1", "Signout");
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
		client.waitForElementVisible('body', 1000);
		client.assert.visible('#createAccountButton');
		client.click('#createAccountButton');
		client.waitForElementVisible('.modal-dialog', 1000);
		client.assert.visible('#inputName').assert.visible("#inputMail").assert.visible("#inputPassword");
		client.setValue('#inputName', account.name);
		client.setValue('#inputMail', account.mail);
		client.setValue('#inputPassword', account.password);
		client.click('#saveButton');
		client.waitForElementVisible('button[type=submit]', 1000);
		client.assert.visible('#inputMail').assert.visible("#inputMail");
		client.setValue('#inputMail', account.mail);
		client.setValue('#inputPassword', account.password);
		client.click('#signinButton');
		client.pause(1000);
		client.assert.containsText("p", "Hi");
		return account;
	},
	joinToFirstGroupWhenSignin : function(client) {
		client.click('#groupArea > div > div > a');
		client.waitForElementVisible("#joinButton", 1000);
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
		client.click('#userNameInMenu');
		client.click('#toEditContentLink');
		client.waitForElementVisible('#contentTitle', 1000);
		client.setValue('#contentTitle', contentTitle);
		client.setValue('tags-input > div > div > input', tags);
		client.setValue('#article', article);
		client.click('select');
		client.waitForElementVisible('option:first-child', 1000);
		client.click('option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click('.btn-primary');
		client.waitForElementVisible("div > div > a > span", 1000);
		client.assert.containsText("div > div > a > span", contentTitle);
		client.getAttribute(".contentListTitle", "href", function(result) {
			client.click("div > div > a > span");
			client.waitForElementVisible("h2", 1000);
			client.assert.containsText("h2", contentTitle);
			client.assert.containsText("#tags > li:first-child", tags.split(",")[0]);
			client.assert.containsText("div > div > div > p", article);
			if (done) {
				done(result.value);
			}
		});
	},
	createContentAndCheckExistsAndComment : function(client, contentUrl, comment) {
		var contentRandom = new Date().getTime();
		var contentComment = "contentComment" + contentRandom;
		var article = "article" + contentRandom;
		client.url(contentUrl);
		client.waitForElementVisible('textarea', 1000);
		client.setValue('textarea', contentComment);
		client.click('.btn-primary');
		client.waitForElementVisible(".commentName", 1000);
		client.assert.containsText(".commentName", comment.account.name);
		client.assert.containsText(".commentMessage", contentComment);
	},
	rewriteTagDescriptionAndCheckExists : function(client, contentUrl, comment) {
		var contentRandom = new Date().getTime();
		var tagDescription = "contentComment" + contentRandom;
		client.url(contentUrl);
		client.waitForElementVisible('#tagArea', 1000);
		client.click('#tagArea > ul > li > a');
		client.waitForElementVisible("button", 1000);
		client.click('button');
		client.waitForElementVisible('#saveButton', 1000);
		client.waitForElementVisible('textarea', 1000);
		client.setValue('textarea', tagDescription);
		client.click('#saveButton');
		client.waitForElementVisible('#descriptionArea', 1000);
		client.assert.containsText("#descriptionArea", tagDescription);
	},
	createGroupAndCheckExists : function(client, callback, openStatusCursor) {
		var contentRandom = new Date().getTime();
		var groupName = "groupName" + contentRandom;
		var groupDescription = "groupDescription" + contentRandom;
		client.url(url + "/groups");
		client.waitForElementVisible('button', 1000);
		client.click('button');
		client.waitForElementVisible("#saveButton", 1000);
		client.setValue('input', groupName);
		client.setValue('textarea', groupDescription);
		client.click('select');
		client.waitForElementVisible('option:first-child', 1000);
		client.click(openStatusCursor ? openStatusCursor : 'option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click('#saveButton');
		client.waitForElementVisible('div#groupName', 1000);
		client.assert.containsText("#groupName", groupName);
		client.assert.containsText("#groupDescription", groupDescription);
		if (callback) {
			client.url(function(result) {
				callback(result.value)
			});
		}
	},
	inviteAccountAfterCreateGroupAndCheckExists : function(client, account) {
		client.setValue('input', account.mail);
		client.click('select');
		client.waitForElementVisible('option:first-child', 1000);
		client.click('option:first-child');
		client.sendKeys('select', client.Keys.ENTER);
		client.click("#inviteButton");
		client.pause(1000);
		client.assert.containsText("#memberArea", account.name);
	},
	visitGroupAndNotVisible : function(client, groupUrl) {
		client.url(groupUrl);
		client.waitForElementVisible('#groupListLink', 1000);
		client.expect.element('#groupName').to.not.be.visible;
	}
}