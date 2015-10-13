var express = require('express');
var router = express.Router();
var Tag = global.db.Tag;
var AccessKey = global.db.AccessKey;
var Content = global.db.Content;
var ContentBody = global.db.ContentBody;
var Sequelize = require("sequelize");
var ERROR_NOTACCESSIBLE = "ERROR_NOTACCESSIBLE";
var ERROR_NOTFOUND = "ERROR_NOTFOUND";
router.get('/listAll', function(req, res) {
	Tag.findAll().then(function(tags) {
		res.status(200).json(tags);
	})["catch"](function(error) {
		console.log(error.stack)
		res.status(500).end();
	});
});
router.put('/:id', function(req, res) {
	var accessKey = req.body.sessionKey || req.body.auth_token;
	if (!req.params.id) {
		res.status(400).end();
		return;
	}
	AccessKey.findBySessionKey(accessKey).then(function(accessKey) {
		if (!accessKey) {
			throw ERROR_NOTACCESSIBLE;
		}
		return Tag.update({
			description : req.body.description,
			updatorId : accessKey.AccountId
		}, {
			where : {
				id : req.params.id
			}
		});
	}).then(function(tags) {
		if (tags[0]) {
			res.status(200).end();
		} else {
			throw ERROR_NOTFOUND;
		}
	})["catch"](function(error) {
		if (error == ERROR_NOTACCESSIBLE) {
			res.status(403).end();
		} else if (error == ERROR_NOTFOUND) {
			res.status(404).end();
		} else {
			console.log(error.stack);
			res.status(500).end();
		}
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
				where : [ "\"Contents\".\"currentVersion\" = \"Contents.ContentBodies\".\"version\"" ],
				attributes : [ "title" ]
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