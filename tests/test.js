var Actions = require(__dirname + "/utils/actions");
var ApiActions = require(__dirname + "/utils/apiActions");
var tests = {
	'Create Account' : function(client) {
		Actions.createAccountAndSignin(client);
		client.end();
	},
	'Create Content' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl) {
			client.end();
		});
	},
	'Update Content' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl) {
			Actions.updateContentAndCheckUpdated(client, function() {
				client.end();
			});
		});
	},
	'Delete Content' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl, content) {
			Actions.deleteContentAndCheckDeleted(client, content, function() {
				client.end();
			});
		});
	},
	'Create Comment' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl) {
			Actions.signout(client);
			var commentAccount = Actions.createAccountAndSignin(client);
			Actions.createContentAndCheckExistsAndComment(client, contentUrl, {
				account : commentAccount
			});
			client.end();
		});
	},
	'Create Tag' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl) {
			Actions.signout(client);
			var commentAccount = Actions.createAccountAndSignin(client);
			Actions.rewriteTagDescriptionAndCheckExists(client, contentUrl);
			client.end();
		});
	},
	'Create Group' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client);
		client.end();
	},
	'Send And Recieve Message' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client, function(groupName, groupUrl) {
			Actions.sendMessage(client, groupName, groupUrl, function() {
				client.end();
			});
		});
	},
	'Invite Exists Account To Group' : function(client) {
		var account = Actions.createAccountAndSignin(client);
		Actions.signout(client);
		var account2 = {
			name : Date.now() + account.name,
			mail : Date.now() + account.mail,
			password : Date.now() + account.password,
		}
		account2 = Actions.createAccountAndSignin(client, account2);
		Actions.createGroupAndCheckExists(client);
		Actions.inviteAccountAfterCreateGroupAndCheckExists(client, account);
		client.end();
	},
	'Request Invitation from Exists Account To Group' : function(client, groupVisiblity, inviteButtonId) {
		var account = Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client, function(groupName, groupUrl) {
			Actions.signout(client);
			var account2 = {
				name : Date.now() + account.name,
				mail : Date.now() + account.mail,
				password : Date.now() + account.password,
			}
			account2 = Actions.createAccountAndSignin(client, account2);
			client.url(groupUrl);
			if (!inviteButtonId) {
				inviteButtonId = "#requestInvitationButtonOnOpen";
			}
			client.waitForElementVisible(inviteButtonId, 1000);
			client.click(inviteButtonId);
			Actions.signout(client);
			Actions.signin(client, account);
			client.url(groupUrl);
			client.waitForElementVisible('#memberArea', 1000);
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div > a", 1000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div > a");
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div > ul > li:last-child", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div > ul > li:last-child");
			Actions.signout(client);
			Actions.signin(client, account2);
			client.url(groupUrl);
			client.assert.equal();
			client.assert.containsText("#memberArea", account2.name);
			client.end();
		}, groupVisiblity);
	},
	'Request Invitation from Exists Account To Group(secret)' : function(client) {
		tests['Request Invitation from Exists Account To Group'](client, 'option:last-child', "#requestInvitationButtonOnSecret")
	},
	'Request Invitation from Not Exists Account To Group' : function(client, groupVisiblity, inviteInputId, inviteButtonId) {
		var account = Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client, function(groupName, groupUrl) {
			Actions.signout(client);
			var account2 = {
				name : Date.now() + account.name,
				mail : Date.now() + account.mail,
				password : Date.now() + account.password,
			}
			client.url(groupUrl);
			if (!inviteInputId) {
				inviteInputId = "#requestInvitationMailInput";
			}
			if (!inviteButtonId) {
				inviteButtonId = "#requestInvitationButtonOnOpen";
			}
			client.setValue(inviteInputId, account2.mail)
			client.waitForElementVisible(inviteButtonId, 1000);
			client.click(inviteButtonId);
			Actions.signin(client, account);
			client.url(groupUrl);
			client.waitForElementVisible('#memberArea', 1000);
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div > a", 1000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div > a");
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div > ul > li:last-child", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div > ul > li:last-child");
			Actions.signout(client);
			Actions.createAccountAndSignin(client, account2);
			client.url(groupUrl);
			client.assert.equal();
			client.assert.containsText("#memberArea", account2.name);
			client.end();
		}, groupVisiblity);
	},
	'Request Invitation from Not Exists Account To Group(secret)' : function(client) {
		tests['Request Invitation from Not Exists Account To Group'](client, 'option:last-child', "#requestInvitationMailInputOnSecret", "#requestInvitationButtonOnSecret")
	},
	'Invite Not Exists Account To Group and Signin' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client);
		var nameAndMail = Date.now() + "inviteAccount@example.com"
		var newAccount = {
			name : nameAndMail,
			mail : nameAndMail,
			password : Date.now()
		}
		Actions.inviteAccountAfterCreateGroupAndCheckExists(client, newAccount);
		Actions.signout(client);
		Actions.createAccountAndSignin(client, newAccount);
		Actions.joinToFirstGroupWhenSignin(client);
		client.end();
	},
	'Account not member is unvisible group' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client, function(groupName, groupUrl) {
			var nameAndMail = Date.now() + "inviteAccount@example.com"
			var newAccount = {
				name : nameAndMail,
				mail : nameAndMail,
				password : Date.now()
			}
			Actions.signout(client);
			Actions.createAccountAndSignin(client, newAccount);
			Actions.visitGroupAndNotVisible(client, groupUrl);
			client.end();
		}, 'option:last-child');
	},
	'Goto Account Page' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl, content) {
			Actions.createGroupAndCheckExists(client, function(groupName, groupUrl, group) {
				client.url(contentUrl);
				client.pause(1000)
				client.waitForElementVisible('#accountName', 1000);
				client.click("#accountName");
				client.waitForElementVisible('.contentListTitle', 1000);
				client.assert.containsText(".contentListTitle", content.title);
				client.assert.containsText("#groupArea", groupName);
				client.end();
			});
		});
	},
	'[API] create account and signin' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				client.end();
			})
		});
	},
	'[API] create content' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				ApiActions.createContent(client.assert, sessionKey, function(content) {
					ApiActions.getContent(client.assert, sessionKey, content, function(content) {
						client.end();
					});
				});
			})
		});
	},
	'[API] put content' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				ApiActions.createContent(client.assert, sessionKey, function(content) {
					ApiActions.getContent(client.assert, sessionKey, content, function(content) {
						ApiActions.updateContent(client.assert, sessionKey, content, function(content) {
							ApiActions.getContent(client.assert, sessionKey, content, function(content) {
								client.end();
							});
						});
					});
				});
			})
		});
	},
	'[API] put content appends before' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				ApiActions.createContent(client.assert, sessionKey, function(content) {
					ApiActions.getContent(client.assert, sessionKey, content, function(content) {
						ApiActions.updateContentWithAppends(client.assert, sessionKey, content, "before", function(content) {
							ApiActions.getContent(client.assert, sessionKey, content, function(content) {
								client.end();
							});
						});
					});
				});
			})
		});
	},
	'[API] put content appends after' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				ApiActions.createContent(client.assert, sessionKey, function(content) {
					ApiActions.getContent(client.assert, sessionKey, content, function(content) {
						ApiActions.updateContentWithAppends(client.assert, sessionKey, content, "after", function(content) {
							ApiActions.getContent(client.assert, sessionKey, content, function(content) {
								client.end();
							});
						});
					});
				});
			})
		});
	},
	'[API] put content appends after and extends except article' : function(client) {
		ApiActions.createAccount(client.assert, function(account) {
			ApiActions.signin(client.assert, account, function(sessionKey) {
				ApiActions.createContent(client.assert, sessionKey, function(content) {
					ApiActions.getContent(client.assert, sessionKey, content, function(content) {
						ApiActions.updateContentWithAppendsOnlyArticle(client.assert, sessionKey, content, "after", function(content) {
							ApiActions.getContent(client.assert, sessionKey, content, function(content) {
								client.end();
							});
						});
					});
				});
			})
		});
	}
};
var testModule = {};
var appended = false;
[].forEach(function(arg) {
	if (tests[arg]) {
		testModule[arg] = tests[arg];
		appended = true;
	}
});
if (appended) {
	module.exports = testModule;
} else {
	module.exports = tests;
}