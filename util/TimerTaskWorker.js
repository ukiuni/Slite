RedisSMQ = require("rsmq");
var Promise = require("bluebird");
var namespace = "rsmq";
var queueName = "taskQueue";
var workerTimerHandler;
var rsmq;
var worker = {
	start : function(redis, timer) {
		if (redis) {
			console.log("--------redis task seeker--------");
			rsmq = rsmq || new RedisSMQ({
				host : redis.host,
				port : redis.port,
				ns : namespace
			});
			var findTasks = function() {
				console.log("findTasks--------");
				return new Promise(function(success) {
					console.log("create queue--------");
					rsmq.createQueue({
						qname : queueName
					}, function(err, resp) {
						success()
					});
				}).then(function() {
					console.log("listen-queue -------");
					return new Promise(function(success, fail) {
						var timerTasks = []
						var receiveMessage = function() {
							rsmq.receiveMessage({
								qname : queueName
							}, function(err, resp) {
								console.log("queue response -------- " + err + ", " + resp);
								if (resp && resp.id) {
									console.log("------ hadQueue ");
									global.db.TimerTask.findById(JSON.parse(resp.message).id).then(function(task) {
										task.done = function() {
											task.destroy();
											rsmq.deleteMessage({
												qname : queueName,
												id : resp.id
											}, function() {
											});
										}
										timerTasks.push(task);
										receiveMessage();
									})["catch"](function(error) {
										fail(error)
									});
								} else {
									console.log("------ no more queue------" + timerTasks);
									success(timerTasks);
								}
							});
						}
						receiveMessage();
					});
				});
			}
		} else {
			console.log("---------non redis task seeker--------");
			var findTasks = function() {
				return global.db.TimerTask.findAll({
					where : {
						targetDate : {
							$lt : new Date()
						}
					}
				}).then(function(timerTasks) {
					return new Promise(function(success) {
						var tasks = timerTasks.map(function(timerTask) {
							timerTask.done = function() {
								timerTask.destroy();
							}
							return timerTask;
						});
						success(tasks);
					})
				});
			}
		}
		findTasks().then(function(timerTasks) {
			timerTasks.forEach(function(timerTask) {
				timerTask.execute().then(function() {
					timerTask.done();
				})["catch"](function(error) {
					console.log("-------task error-" + error.stack);
				})
			});
			workerTimerHandler = setTimeout(function() {
				worker.start(redis, timer);
			}, timer || 30000);
		})
	},
	stop : function() {
		clearTimeout(workerTimerHandler)
	}
}
if (require.main !== module) {
	module.exports = worker
} else {
	console.log("kick Start");
	var env = process.env.NODE_ENV || "development";
	var serverConfig = require(__dirname + "/../config/server.json")[env];
	var db = require(__dirname + '/../models');
	var redis = serverConfig.redis;
	var rsmq = new RedisSMQ({
		host : redis.host,
		port : redis.port,
		ns : namespace
	});
	db.sequelize.sync().done(function(param) {
		global.db.TimerTask.findAll({
			where : {
				targetDate : {
					$lt : new Date(new Date().getTime() + 30000)//To reduce the error from work interval.
				}
			}
		}).then(function(timerTasks) {
			var promise = new Promise(function(success) {
				success()
			});
			console.log("task loaded ---- count " + timerTasks.length);
			timerTasks.forEach(function(timerTask) {
				promise = promise.then(function() {
					return new Promise(function(success) {
						rsmq.sendMessage({
							qname : queueName,
							message : JSON.stringify({
								id : timerTask.id
							})
						}, function(err, resp) {
							success();
						});
					})
				});
			});
			return promise;
		}).then(function() {
			console.log("task kick -done-------");
			rsmq.quit();
		})["catch"](function(error) {
			console.log("task kick -fail-------" + error.stack);
			rsmq.quit();
		});
	})
}