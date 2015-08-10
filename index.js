var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var ECT = require('ect');
var db = require('./models');
var ectRenderer = ECT({
	watch : true,
	root : __dirname + '/views'
});
var app = express();
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');
app.set('port', process.env.PORT || 3030);
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(multer({
	storage : multer.memoryStorage()
}).fields([ {
	name : "imageFile",
	maxCount : 1
} ]));
app.use(express.static(path.join(__dirname, 'public')));
require('./routes')(app);
db.sequelize.sync().done(function(param) {
	var server = http.Server(app);
	server.listen(app.get('port'), function() {
		console.log('Slite server listening on port ' + app.get('port'))
	});
});