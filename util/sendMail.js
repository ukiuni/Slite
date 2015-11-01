var nodemailer = require("nodemailer");
var env = process.env.NODE_ENV || "development";
var serverConfig = require(__dirname + "/../config/server.json")[env];
var Promise = require("bluebird");
var transporter;
if (!serverConfig.smtp) {
	transporter = {
		type : "dummy",
		sendMail : function(message, callback) {
			console.log("Send mail ====> " + JSON.stringify(message));
			callback(null, "success")
		}
	}
} else {
	var smtpTransport = require(serverConfig.smtp.transport);
	transporter = nodemailer.createTransport(smtpTransport(serverConfig.smtp));
}
module.exports = {
	send : function(message) {
		return new Promise(function(success, fail) {
			try {
				mail = transporter.sendMail(message, function(error, sended) {
					if (error) {
						fail(error);
					} else if (sended) {
						success(sended)
					} else {
						fail();
					}
				});
			} catch (e) {
				fail(e);
			}
		});
	}
}