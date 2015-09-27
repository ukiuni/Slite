var Actions = require(__dirname + "/utils/actions");
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