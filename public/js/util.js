if (!com) {
	var com = {}
}
if (!com.ukiuni) {
	com.ukiuni = {}
}
com.ukiuni.ImageUtil = {
	captureVideo : function(videoSrc) {
		var canvas = document.createElement("canvas");
		canvas.width = video.videoWidth * scale;
		canvas.height = video.videoHeight * scale;
		canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
		return canvas;
	},
	toHex : function(text, min, max) {
		if (!text || "" == text) {
			var bgRandom = min.toString(16);
		} else {
			var bgRandom = (((text.charCodeAt(text.length - 1) + min)) % max).toString(16);
		}
		while (2 > bgRandom.length) {
			bgRandom = "0" + bgRandom;
		}
		if (bgRandom.length > 2) {
			bgRandom = bgRandom.substring(bgRandom.length - 2, bgRandom.length);
		}
		return bgRandom;
	},
	createTextImage : function(imageWidth, imageHeight, textX, textY, textSize, text) {
		var canvas = document.createElement("canvas");
		canvas.width = imageWidth;
		canvas.height = imageHeight;
		var context = canvas.getContext('2d');
		var ranHex = this.toHex(text, 0, 100);
		context.fillStyle = "#" + ranHex + "4F4F";
		context.fillRect(0, 0, imageWidth, imageHeight)
		context.fillStyle = "#99CC" + ranHex;
		context.shadowBlur = 10;
		context.shadowColor = "#FFFFFF";
		context.font = textSize + "px sans-serif";
		context.fillText(text, textX, textY);
		// this.blur(canvas, context);
		return canvas;
	},
	trimImage : function(imageSrc, destWidth, destHeight, callback) {
		var image = new Image();
		image.onload = function() {
			trim(image, destWidth, destHeight, callback)
		}
		image.src = imageSrc;
	},
	trim : function(image, destWidth, destHeight, callback) {
		var scale = destWidth / image.width > destHeight / image.height ? destWidth / image.width : destHeight / image.height;
		var trimCanvas = document.createElement('canvas');
		trimCanvas.width = destWidth;
		trimCanvas.height = destHeight;
		var smCtx = smallCanvas.getContext('2d');
		trimCanvas(image, 0, 0, image.width, image.height, image.width * (scale - 1) / 2, image.height * (scale - 1) / 2, image.width, image.height);
	},
	canvasToPingBlob : function(canvas) {
		var base64Data = canvas.toDataURL('image/png').split(',')[1];
		var data = atob(base64Data);
		var buff = new ArrayBuffer(data.length)
		var arr = new Uint8Array(buff);
		for (var i = 0; i < data.length; i++) {
			arr[i] = data.charCodeAt(i);
		}
		var blob = new Blob([ arr ], {
			type : 'image/png'
		});
		callback(blob);
	},
	blur : function(canvas, context) {
		var data = context.getImageData(0, 0, canvas.width, canvas.height);
		var width = canvas.width
		var marume = function(data, preLineIndex, currentLineIndex, nextLineIndex, col) {
			return (data[preLineIndex - zurasi] + data[preLineIndex] + data[preLineIndex + zurasi] + data[currentLineIndex - zurasi] + data[currentLineIndex] + data[currentLineIndex + zurasi] + data[nextLineIndex - zurasi] + data[nextLineIndex] + data[nextLineIndex + zurasi]) / 9
		}
		for (var i = 0; i < data.length; i += 4) {
			var preLineIndex = i - width * 4;
			var currentLineIndex = i;
			var nextLineIndex = i + width * 4;
			data[i] = marume(data, preLineIndex, currentLineIndex, 1);
			data[i + 1] = marume(data, preLineIndex, currentLineIndex, 2);
			data[i + 2] = marume(data, preLineIndex, currentLineIndex, 3);
		}
	}
}