// marian size fix
$(document).ready(function () {
	$.fn.qtip.styles.tutorials = {
		border: {
			width: 0,
			radius: 0
		},
		classes: {
			tooltip: 'qtip-tutorial'
		},
		padding: 0,
		textAlign: 'left',
		width: 434,
		overflow: 'visible',
		tip: true // Give it a speech bubble tip with automatic corner detection
	 };
});
function openTutorial() {
    put_qtip(target);
    //mark as opened
    $.post("/tut-adv.php", { cmd: 'mark' }, function(res) {});
    $(".tutor_advisor").removeClass("tutorPulse");
    $(".tutor_advisor").attr("onClick","closeTutorial()");
}

function nextStep() {
    $.post("/tut-adv.php", { cmd: 'nextStep' }, function(res) { $(".qtip").qtip('destroy'); var nextTarget = search_alternatives(jQuery.parseJSON(res)); put_qtip(nextTarget); });
    $(".tutor_advisor").removeClass("tutorPulse");
    $(".tutor_advisor").attr("onClick","closeTutorial()");
}

function closeTutorial() {
    $(".tutor-hide").click();
    $(".tutor_advisor").attr("onClick","openTutorial()");
}