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
		context.fillStyle = "#" + ranHex + "88CC";
		context.fillRect(0, 0, imageWidth, imageHeight)
		ranHex = this.toHex(text, 200, 255);
		context.fillStyle = "#DDFF" + ranHex;
		context.shadowBlur = 10;
		context.shadowColor = "#FFFFFF";
		context.font = textSize + "px sans-serif";
		context.fillText(text, textX, textY);
		// this.blur(canvas, context);
		return canvas;
	},
	createIconImage : function(imageWidth, imageHeight, contentType) {
		var margin = 20;
		var dogEar = 40;
		var filePathHeight = imageHeight - margin * 2;
		var filePathWidth = filePathHeight / 5 * 4;
		var canvas = document.createElement("canvas");
		canvas.width = imageWidth;
		canvas.height = imageHeight;
		var context = canvas.getContext('2d');
		var typeText = (contentType).match(/([^\/]+)\/[^\/]/)[1];
		var context = canvas.getContext('2d');
		context.fillStyle = 'rgba(255, 255, 255, 0)';
		context.fillRect(0, 0, imageWidth, imageHeight)
		context.fillStyle = 'rgba(255, 255, 255, 1.0)';
		context.lineJoin = "round";
		context.beginPath();
		context.moveTo((imageWidth - filePathWidth) / 2, 10);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth - dogEar, 10);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth, 10 + dogEar);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth, 10 + filePathHeight);
		context.lineTo((imageWidth - filePathWidth) / 2, 10 + filePathHeight);
		context.lineTo((imageWidth - filePathWidth) / 2, 10);
		context.fill();
		context.strokeStyle = "#333";
		context.lineWidth = 5;
		context.beginPath();
		context.moveTo((imageWidth - filePathWidth) / 2, 10);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth - dogEar, 10);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth - dogEar, 10 + dogEar);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth, 10 + dogEar);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth - dogEar, 10);
		context.moveTo((imageWidth - filePathWidth) / 2 + filePathWidth, 10 + dogEar);
		context.lineTo((imageWidth - filePathWidth) / 2 + filePathWidth, 10 + filePathHeight);
		context.lineTo((imageWidth - filePathWidth) / 2, 10 + filePathHeight);
		context.lineTo((imageWidth - filePathWidth) / 2, 10);
		context.lineTo((imageWidth) / 2, 10);
		context.stroke();
		context.fillStyle = 'rgba(48, 48, 48, 1.0)';
		context.shadowBlur = 10;
		context.shadowColor = "#FFFFFF";
		var fontSize = (imageWidth / 6);
		context.font = fontSize + "px sans-serif";
		var textMetrix = context.measureText(typeText);
		context.fillText(typeText, (imageWidth - textMetrix.width) / 2, (imageHeight) / 2 + margin);
		return canvas;
	},
	trimImage : function(imageSrc, destWidth, destHeight, callback) {
		var image = new Image();
		image.onload = function() {
			trim(image, destWidth, destHeight, callback)
		}
		image.src = imageSrc;
	},
	trim : function(image, destWidth, destHeight) {
		return this.canvasToPngBlob(this.justTrim(image, destWidth, destHeight));
	},
	justTrim : function(image, destWidth, destHeight) {
		var scale = destWidth / image.width > destHeight / image.height ? destWidth / image.width : destHeight / image.height;
		var trimCanvas = document.createElement('canvas');
		trimCanvas.width = destWidth;
		trimCanvas.height = destHeight;
		var trimCanvasContext = trimCanvas.getContext('2d');
		trimCanvasContext.drawImage(image, 0, 0, image.width, image.height, (destWidth - image.width * scale) / 2, (destHeight - image.height * scale) / 2, image.width * scale, image.height * scale);
		return trimCanvas;
	},
	trimAndAppendPlayIcon : function(image, destWidth, destHeight) {
		var trimCanvas = this.justTrim(image, destWidth, destHeight);
		var context = trimCanvas.getContext('2d');
		context.fillStyle = 'rgba(255, 255, 255, 0.7)';
		var circleWidth = destWidth / 10;
		var circleHeight = destHeight / 10;
		var ciecleX = destWidth / 10 * 9;
		var ciecleY = destHeight / 10 * 9;
		context.arc(ciecleX, ciecleY, circleWidth, 0, Math.PI * 2, false);
		context.fill();
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.beginPath();
		var triangleSize = destWidth / 15;
		context.moveTo(ciecleX - triangleSize, ciecleY - triangleSize);
		context.lineTo(ciecleX - triangleSize, ciecleY + triangleSize);
		context.lineTo(ciecleX + triangleSize, ciecleY);
		context.closePath();
		context.fill();
		return this.canvasToPngBlob(trimCanvas);
	},
	canvasToPngBlob : function(canvas) {
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
		return blob;
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