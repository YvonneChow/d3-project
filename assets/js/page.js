$(document).ready(function($) {
	$(".hero-section button").click(function(event) {
		$(".hero-section h1").toggle();
		$(".hero-section p").toggle();
	});

	$('.carousel').carousel({
		interval: false
	});

	$(window).scroll(function(event) {
		/* Act on the event */
		
		if( $(window).scrollTop() > 20 ) {
			$(".navbar").addClass('scrolled');
		}
		else {
			$(".navbar").removeClass('scrolled');
		}
	});
});