var express = require('express');
var router = express.Router();
var Tag = global.db.Tag;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Sequelize = require("sequelize");
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
router.get('/listAll', function(req, res) {
	Tag.findAll().then(function(tags) {
		res.status(200).json(tags);
	})["catch"](function(error) {
		console.log(error.stack)
		res.status(500).end();
	});
});
router.get('/:id/contents', function(req, res) {
	Tag.findAll({
		where : {
			id : req.params.id
		},
		include : [ {
			model : Content,
			include : [ {
				model : ContentBody,
				where : [ "`Contents`.`currentVersion` = `Contents.ContentBodies`.`version`" ]
			} ]
		} ]
	}).then(function(tags) {
		var tag = tags[0];
		if (!tag) {
			throw ERROR_NOTFOUND;
		}
		res.status(200).json(tag);
	})["catch"](function(error) {
		console.log(error.stack);
		if (error == ERROR_NOTFOUND) {
			res.status(404).end();
		} else {
			res.status(500).end();
		}
	});
});
router.get('/q/:query', function(req, res) {
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