var fs = require('fs');
var path = require('path');
module.exports = function(app) {
	var load = function(rootDirectory, postfix) {
		fs.readdirSync(path.join(rootDirectory, postfix)).filter(function(file) {
			return (file.indexOf(".") !== 0) && (file !== "index.js");
		}).forEach(function(file) {
			var stat = fs.statSync(path.join(rootDirectory, postfix, file));
			if (stat.isDirectory()) {
				load(rootDirectory, path.join(postfix, file));
			} else {
				var name = file.substr(0, file.indexOf('.'));
				var router = require(path.join(rootDirectory, postfix, file));
				var route = path.join("/" + postfix, name);
				app.use(route, router);
			}
		});
		app.get('/*', function(req, res) {
			res.sendFile(path.join(__dirname, '../public', 'index.html'));
		});
	}
	load(__dirname, "");
	app.get('/', function(req, res) {
		res.render('index', {});
	});
}