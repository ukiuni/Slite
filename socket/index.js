var socket = function(io) {
	var connected;
	this.context = io.sockets.on('connection', function(socket) {
		connected = socket;
		socket.on('joinToRoom', function(contentKey) {
			socket.join(contentKey);
		});
		socket.on('leaveFromRoom', function(contentKey) {
			socket.leave(contentKey);
		});
	});
	this.sendToContent = function(contentKey, comment) {
		io.to("content:" + contentKey).emit("content:" + contentKey, JSON.stringify(comment));
	}
	return this;
}
module.exports = socket;