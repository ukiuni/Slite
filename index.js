var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var multer = require('multer');
var ECT = require('ect');
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/config/server.json")[env];
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
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(multer({
	storage : multer.memoryStorage()
	/*storage : multer.diskStorage({
		destination : function(req, file, cb) {
			cb(null, '/tmp')
		},
		filename : function(req, file, cb) {
			cb(null, file.fieldname + '-' + Date.now())
		}
	})*/
}).fields([ {
	name : "imageFile",
	maxCount : 1
} ]));
app.use(express.static(path.join(__dirname, 'public')));
db.sequelize.sync().done(function(param) {
	var server = http.Server(app);
	var io = require('socket.io').listen(server);
	if (serverConfig.redis) {
		var redis = require('socket.io-redis');
		io.adapter(redis(serverConfig.redis));
	}
	global.socket = new require('./socket')(io);
	require('./routes')(app);
	server.listen(app.get('port'), function() {
		http.createServer(function(req, res) {
			res.writeHead(200, {
				'Content-Type' : 'text/plain'
			});
			console.log("====shutdown called...====");
			res.write('shutdowning.');
			server.close(function() {
				console.log("====server closed...====");
				res.write('.');
			});
			setTimeout(function() {
				res.write('.');
				res.end('complete\n');
				console.log("====shutdown====");
				process.exit();
			}, 10000);
		}).listen(parseInt(app.get('port')) + 10000, '127.0.0.1', function() {
			console.log('Slite server listening on port ' + app.get('port') + " and manage port " + (parseInt(app.get('port')) + 10000))
		});
	});
});