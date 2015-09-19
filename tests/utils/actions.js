var url = 'http://localhost:3030';
module.exports = {
	signout : function(client) {
		client.click('a.dropdown-toggle');
		client.waitForElementVisible('#signoutButton', 1000);
		client.click('#signoutButton');
		client.waitForElementVisible('#createAccountButton', 1000);
		client.assert.containsText("h1", "Signout");
	},
	createAccountAndSignin : function(client, done) {
		var accountRandom = new Date().getTime();
		client.url(url);
		client.waitForElementVisible('body', 1000);
		client.assert.visible('#createAccountButton');
		client.click('#createAccountButton');
		client.waitForElementVisible('.modal-dialog', 1000);
		client.assert.visible('#inputName').assert.visible("#inputMail").assert.visible("#inputPassword");
		client.setValue('#inputName', 'testAccount' + accountRandom);
		client.setValue('#inputMail', 'testAccount' + accountRandom + "@example.com");
		client.setValue('#inputPassword', accountRandom);
		client.click('#saveButton');
		client.waitForElementVisible('button[type=submit]', 1000);
		client.assert.visible('#inputMail').assert.visible("#inputMail");
		client.setValue('#inputMail', 'testAccount' + accountRandom + "@example.com");
		client.setValue('#inputPassword', accountRandom);
		client.click('#signinButton');
		client.pause(1000);
		client.assert.containsText("p", "Hi");
		return {
			name : 'testAccount' + accountRandom,
			mail : 'testAccount' + accountRandom + "@example.com",
			password : accountRandom
		}
		if (done) {
			done();
		}
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
	rewriteTagDescriptionAndCheck : function(client, contentUrl, comment) {
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
	}
}