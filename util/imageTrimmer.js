var Jimp = require("jimp");
var Promise = require("bluebird");
module.exports = {
	trim : function(buffer, width, height) {
		return new Promise(function(onFulfilled, onRejected) {
			new Jimp(buffer, function(error, image) {
				if (error) {
					onRejected(error);
					return;
				}
				image.resize(width, height);
				image.bitmap.data
				image.getBuffer(Jimp.MIME_PNG, function(error, buffer) {
					if (error) {
						onRejected(error)
						return;
					}
					onFulfilled({
						buffer : buffer,
						contentType : Jimp.MIME_PNG
					});
				});
			});
		});
	}
}