var express = require('express');
var router = express.Router();
var Tag = global.db.Tag;
router.get('/:query', function(req, res) {
	Tag.findAll({
		where : {
			name : {
				$like : req.params.query + '%'
			}
		}
	}).then(function(tags) {
		tags = tags.map(function(val) {
			return {
				text : val.name
			}
		});
		res.status(200).json(tags);
	})["catch"](function(error) {
		console.log(error.stack)
		res.status(500).end();
	});
});
module.exports = router;