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
	'Private account not visible' : function(client) {
		var account = Actions.createAccountAndSignin(client);
		Actions.signout(client);
		Actions.createAccountAndSignin(client);
		Actions.gotoAccountUrlAndNotVisible(client, account.id);
		client.end();
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
	'Request Invitation from Exists Account To Group' : function(client, groupVisiblity, inviteButtonId, onComplete) {
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
			client.waitForElementVisible(inviteButtonId, 10000);
			client.click(inviteButtonId);
			Actions.signout(client);
			Actions.signin(client, account);
			client.url(groupUrl);
			client.waitForElementVisible('#memberArea', 1000);
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > a", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > a");
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > ul > li:nth-last-child(3)", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > ul > li:nth-last-child(3)");
			Actions.signout(client);
			Actions.signin(client, account2);
			client.url(groupUrl);
			client.waitForElementVisible('#memberArea', 1000);
			client.assert.containsText("#memberArea", account2.name);
			if (onComplete) {
				onComplete(account, account2, groupUrl);
			} else {
				client.end();
			}
		}, groupVisiblity);
	},
	'Request Invitation from Exists Account To Group(secret)' : function(client) {
		tests['Request Invitation from Exists Account To Group'](client, 'li:last-child', "#requestInvitationButtonOnSecret")
	},
	'Request Invitation from Not Exists Account To Group' : function(client, groupVisiblity, inviteInputId, inviteButtonId, onComplete) {
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
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > a", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > a");
			client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > ul > li:nth-last-child(3) > a", 10000);
			client.click("#memberArea > div > div:last-child > div > div > div:last-child > div:last-child > ul > li:nth-last-child(3) > a");
			client.pause(1000);
			Actions.signout(client);
			Actions.createAccountAndSignin(client, account2);
			client.url(groupUrl);
			client.waitForElementVisible('#memberArea', 1000);
			client.assert.containsText("#memberArea", account2.name);
			if (onComplete) {
				onComplete(account, account2, groupUrl);
			} else {
				client.end();
			}
		}, groupVisiblity);
	},
	'Strike from group' : function(client) {
		tests['Request Invitation from Exists Account To Group'](client, 'li:last-child', "#requestInvitationButtonOnSecret", function(account, account2, groupUrl) {
			Actions.signout(client);
			Actions.signin(client, account);
			client.url(groupUrl);
			client.waitForElementVisible('#editButton', 1000);
			client.click("#editButton");
			client.waitForElementVisible('#saveButton', 1000);
			client.click("#memberArea > div:last-child > div > div:last-child > div > a");
			client.waitForElementVisible("#memberArea > div:last-child > div > div:last-child > div > ul > li:last-child > a", 1000);
			client.click("#memberArea > div:last-child > div > div:last-child > div > ul > li:last-child > a");
			client.waitForElementVisible('#deleteButton', 1000);
			client.click("#deleteButton");
			client.pause(1000);
			Actions.signout(client);
			Actions.signin(client, account2);
			client.url(groupUrl);
			client.waitForElementVisible('#notVisibleInformationArea', 1000);
			client.end();
		});
	},
	'Request Invitation from Not Exists Account To Group(secret)' : function(client) {
		tests['Request Invitation from Not Exists Account To Group'](client, 'li:last-child', "#requestInvitationMailInputOnSecret", "#requestInvitationButtonOnSecret")
	},
	'Request Invite from Content' : function(client) {
		var account = Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client, function(groupName, groupUrl) {
			Actions.createContentAndCheckExists(client, function(contentUrl, content) {
				Actions.signout(client);
				var account2 = {
					name : Date.now() + account.name,
					mail : Date.now() + account.mail,
					password : Date.now() + account.password,
				}
				account2 = Actions.createAccountAndSignin(client, account2);
				client.url(contentUrl);
				client.waitForElementVisible('#requestInvitationButtonOnSecret', 1000);
				client.click("#requestInvitationButtonOnSecret");
				client.waitForElementVisible('.toast', 1000);
				client.click(".toast");// For hide toast caz it hides sign out
				// button
				client.waitForElementVisible('.toast', 1000);
				client.click(".toast");// For hide toast caz it hides sign out
				// button
				client.waitForElementNotPresent('.toast', 10000);
				Actions.signout(client);
				Actions.signin(client, account);
				client.url(groupUrl);
				client.waitForElementVisible('#memberArea', 1000);
				client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child >  div:last-child > a", 10000);
				client.click("#memberArea > div > div:last-child > div > div > div:last-child >  div:last-child > a");
				client.waitForElementVisible("#memberArea > div > div:last-child > div > div > div:last-child >  div:last-child > ul > li:nth-last-child(3) > a", 10000);
				client.click("#memberArea > div > div:last-child > div > div > div:last-child >  div:last-child > ul > li:nth-last-child(3) > a");
				client.pause(1000);
				Actions.signout(client);
				Actions.signin(client, account2);
				client.url(contentUrl);
				client.waitForElementVisible('#joinButton', 1000);
				client.click("#joinButton");
				client.waitForElementVisible(".contentTitle", 10000);
				client.assert.containsText(".contentTitle", content.title);
				client.end();
			}, "li:last-child", "li:last-child");
		});
	},
	'Invite Not Exists Account To Group and Signin' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createGroupAndCheckExists(client);
		var name = Date.now() + "inviteAccount"
		var nameAndMail = Date.now() + "inviteAccount@example.com"
		var newAccount = {
			name : name,
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
			var name = Date.now() + "inviteAccount"
			var nameAndMail = Date.now() + "inviteAccount@example.com"
			var newAccount = {
				name : name,
				mail : nameAndMail,
				password : Date.now()
			}
			Actions.signout(client);
			Actions.createAccountAndSignin(client, newAccount);
			Actions.visitGroupAndNotVisible(client, groupUrl);
			client.end();
		}, 'li:last-child');
	},
	'Goto Account Page' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createContentAndCheckExists(client, function(contentUrl, content) {
			Actions.createGroupAndCheckExists(client, function(groupName, groupUrl, group) {
				client.url(contentUrl);
				client.waitForElementVisible('#accountName', 1000);
				client.click("#accountName");
				client.waitForElementVisible('.contentListTitle', 1000);
				client.assert.containsText(".contentListTitle", content.title);
				client.assert.containsText("#groupArea", groupName);
				client.end();
			});
		});
	},
	'Goto next month on calendar content' : function(client) {
		Actions.createAccountAndSignin(client);
		Actions.createCalendarAndGotoNextAndPrevPage(client, function() {
			client.end();
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