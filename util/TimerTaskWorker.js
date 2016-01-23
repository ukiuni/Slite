var RedisSMQ;
var Redis;
var Promise = require("bluebird");
var NAME_SPACE = "rsmq";
var QUEUE_NAME = "taskQueue";
var TIMER_EVENT_CHANNEL_NAME = "timerEventChannel";
var workerTimerHandler;
var rsmq;
var redis;
var executeTasks = function(timerTasks) {
	timerTasks.forEach(function(timerTask) {
		timerTask.execute().then(function() {
			timerTask.done();
		})["catch"](function(error) {
			console.log("-------task error-" + error.stack);
		})
	});
}
var worker = {
	start : function(redisConf, timer) {
		if (redisConf) {
			RedisSMQ = RedisSMQ || require("rsmq");
			Redis = Redis || require("redis")
			console.log("--------redis task seeker--------");
			redis = redis || Redis.createClient(redisConf.port, redisConf.host)
			rsmq = rsmq || new RedisSMQ({
				host : redisConf.host,
				port : redisConf.port,
				ns : NAME_SPACE
			});
			redis.subscribe(TIMER_EVENT_CHANNEL_NAME);
			redis.on("message", function(channel, data) {
				console.log("--------event rized--------");
				if (TIMER_EVENT_CHANNEL_NAME == channel) {
					findTasks();
				}
			});
			var handleError = function(err) {
				console.log("redis error -------" + err);
				try {
					redis.quit();
				} catch (ignored) {
				}
				try {
					rsmq.quit();
				} catch (ignored) {
				}
				redis = null;
				rsmq = null;
				setTimeout(function() {
					worker.start(redisConf, timer);
				}, 10000);
			}
			redis.on("error", function(err) {
				handleError(err)
			});
			var findTasks = function() {
				console.log("findTasks--------");
				return new Promise(function(success) {
					console.log("create queue--------");
					rsmq.createQueue({
						qname : QUEUE_NAME
					}, function(err, resp) {
						success()
					});
				}).then(function() {
					console.log("listen-queue -------");
					new Promise(function(success, fail) {
						var timerTasks = []
						var receiveMessage = function() {
							rsmq.receiveMessage({
								qname : QUEUE_NAME
							}, function(err, resp) {
								console.log("queue response -------- " + err + ", " + resp);
								if (resp && resp.id) {
									console.log("------ hadQueue ");
									global.db.TimerTask.findById(JSON.parse(resp.message).id).then(function(task) {
										task.done = function() {
											task.destroy();
											rsmq.deleteMessage({
												qname : QUEUE_NAME,
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
					}).then(function(tasks) {
						executeTasks(tasks);
					})["catch"](function(err) {
						handleError(err)
					});
				});
			}
		} else {
			console.log("---------non redis task seeker--------");
			global.db.TimerTask.findAll({
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
			}).then(executeTasks);
			workerTimerHandler = setTimeout(function() {
				worker.start(redisConf, timer);
			}, timer || 30000);
		}
	},
	stop : function() {
		if (workerTimerHandler) {
			clearTimeout(workerTimerHandler);
		} else if (redis) {
			try {
				redis.quit();
			} catch (ignore) {
			}
			try {
				rsmq.quit();
			} catch (ignore) {
			}
		}
	}
}
if (require.main !== module) {
	module.exports = worker
} else {
	console.log("kick Start");
	var RedisSMQ = require("rsmq");
	var Redis = require("redis")
	var env = process.env.NODE_ENV || "development";
	var serverConfig = require(__dirname + "/../config/server.json")[env];
	var db = require(__dirname + '/../models');
	var redisConf = serverConfig.redis;
	var rsmq = new RedisSMQ({
		host : redisConf.host,
		port : redisConf.port,
		ns : NAME_SPACE
	});
	var redis = Redis.createClient(redisConf.port, redisConf.host);
	db.sequelize.sync().done(function(param) {
		global.db.TimerTask.findAll({
			where : {
				targetDate : {
					$lt : new Date(new Date().getTime() + 30000)
				// To reduce the error from work interval.
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
							qname : QUEUE_NAME,
							message : JSON.stringify({
								id : timerTask.id
							})
						}, function(err, resp) {
							success();
						});
					})
				});
			});
			if (0 < timerTasks.length) {
				redis.publish(TIMER_EVENT_CHANNEL_NAME, "find timertasks from db.");
			}
			return promise;
		}).then(function() {
			console.log("task kick -done-------");
			redis.quit();
			rsmq.quit();
		})["catch"](function(error) {
			console.log("task kick -fail-------" + error.stack);
			redis.quit();
			rsmq.quit();
		});
	})
}