var express = require('express');
var router = express.Router();
var Storage = require(__dirname + "/../../util/storage");
router.get('/:imageKey', function(req, res) {
	if (!req.params.imageKey || req.params.imageKey.indexOf("/../") > -1) {
		res.status(404).send();
		return;
	}
	Storage.load(req.params.imageKey).then(function(data) {
		res.set('Content-Type', data.contentType);
		res.status(200).send(data.buffer);
	})["catch"](function(error) {
		res.status(404).send();
	});
})
module.exports = router;