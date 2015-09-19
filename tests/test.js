var Actions = require(__dirname + "/utils/actions");
module.exports = {
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
			Actions.rewriteTagDescriptionAndCheck(client, contentUrl);
			client.end();
		});
	},
};