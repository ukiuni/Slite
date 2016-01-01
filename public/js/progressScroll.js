$(function() {
	var nav = $('#progressArea'), offset = nav.offset();
	$(window).scroll(function() {
		if ($(window).scrollTop() >= offset.top - 15) {
			nav.addClass('progressFixed');
			nav.removeClass('progressAbsolute');
		} else {
			nav.removeClass('progressFixed');
			nav.addClass('progressAbsolute');
		}
	});
})
