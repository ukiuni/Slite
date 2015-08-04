var express = require('express');
var router = express.Router();
router.get('/messages', function(req, res) {
	try {
		var messages = require(__dirname + "/../../res/messages.json")[req.query.lang];
		if (messages) {
			res.status(200).json(messages);
			return;
		}
	} catch (ignored) {
	}
	res.status(200).json(require(__dirname + "/../../res/messages.json")["default"]);
});
module.exports = router;