


$(document).ready(function()
{
	var easyList = $('tr#qDiff1');
	var normalList = $('tr#qDiff2');
	var hardList = $('tr#qDiff3');
	var qList = $('div#questList');
	var qContainer = $('table#qListContainer');
	var tabList = $('.tabs');
	
	var tabArray = new Array(
		new Array(easyList, $(tabList).children()[0]), 
		new Array(normalList, $(tabList).children()[1]), 
		new Array(hardList, $(tabList).children()[2])
	);
	
	
	
	qInit();
	
	
function showList(list, status) {
	if(status == 1) {
		$(list[0]).show();
		
		$(list[1]).css('font-weight', 'bold');
		$(list[1]).css('color', '#ffcc00');
	}
	else {
		$(list[0]).hide();
		
		$(list[1]).css('font-weight', 'inherit');
		$(list[1]).css('color', 'inherit');
	}
}

function switchList(index) {
	var status = new Array(0,0,0);
	status[index] = 1;
	
	showList(tabArray[0], status[0]);
	showList(tabArray[1], status[1]);
	showList(tabArray[2], status[2]);
}

function qInit()
{
	switchList(0);
	
	qList.show();
	
	$.each(tabList.children(), function(index, tab){
		$(tab).click(function() {
			switchList(index);
		});
	}
	);	
}
});