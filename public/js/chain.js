var Chain = function(current, before) {
	this.current = current;
	this.before = before;
	this.nextChain;
	this.onError;
}
Chain.prototype.then = function(next) {
	this.nextChain = new Chain(next, this);
	return this.nextChain;
}
Chain.prototype.error = function(errorFunc) {
	this.onError = errorFunc;
};
Chain.prototype.rizeError = function(e) {
	if (this.onError) {
		this.onError(e);
	} else if (nextChain) {
		this.nextChain.rizeError(e);
	} else {
		throw e;
	}
}
Chain.prototype.exec = function() {
	if (this.current) {
		var self = this;
		this.current(function() {
			if (self.nextChain) {
				self.nextChain.exec();
			}
		});
	} else {
		this.nextChain.exec();
	}
}
Chain.prototype.fire = function() {
	if (this.before) {
		this.before.fire();
	} else {
		this.exec();
	}
}