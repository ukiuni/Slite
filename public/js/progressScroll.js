$(function() {
	var nav = $('#progressArea');
	$(window).scroll(function() {
		if ($(window).scrollTop() >= 35) {
			nav.addClass('progressFixed');
			nav.removeClass('progressAbsolute');
		} else {
			nav.removeClass('progressFixed');
			nav.addClass('progressAbsolute');
		}
	});
})
