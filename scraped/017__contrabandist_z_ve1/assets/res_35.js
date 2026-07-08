$(function() {
    var dontShowDragHelper = false;
    
    var container=$("#windows-modal");
    
    function handleModalClose() {
	container.bind('click',function(e) {
	    if ( (this===e.target) || $(e.target).hasClass('mclose_') || $(e.target).hasClass('del') || $(e.target).hasClass('ok-locked')  || $(e.target).hasClass('ok-locked')) {
		dontShowDragHelper = false;
	    }
	});
    }
    
    $('div.my_slots .item, div.contrabandist_slots .item').draggable({
	revert: 'invalid',
	revertDuration: 100,
	helper: function() {
	    if (dontShowDragHelper) {
		return false;
	    }
			
	    $(this).find('.json').tooltip().unbind();
	    var helper=$(this).find('.json').clone().css({'-moz-box-shadow':'0px 0px 5px #000000',border:'1px solid #ffcc00'});
	    $('body').append(helper);
	    helper.maxZIndex();
	    return helper;
	},
	start: function() {
	    if($(this).closest('.inventory_slots').hasClass('contrabandist_slots')) {
		$('.my_slots').toggleClass('inventory_highlight',true);
	    } else {
		$('.contrabandist_slots').toggleClass('inventory_highlight',true);
	    }
	},
	stop: function() {
	    $(this).find('.json').tooltip().bind();
	    if($(this).closest('.inventory_slots').hasClass('contrabandist_slots')) {
		$('.my_slots').toggleClass('inventory_highlight',false);
	    } else {
		$('.contrabandist_slots').toggleClass('inventory_highlight',false);
	    }
	}
    }).click(function() {
	if ($(this).closest('.inventory_slots').hasClass('my_slots')) {
	    var action='sell';
	} else {
	    var action='buy';
	}
	dontShowDragHelper = true;
	$.modal().show('single').prepare({item:$(this),action:action});
	handleModalClose();
    });

    $('div.my_slots').droppable({
	accept: 'div.contrabandist_slots div.item',
	drop: function(event, ui) {
	    dontShowDragHelper = true;
	    $.modal().show('single').prepare({item:ui.draggable,action:'buy'});
	    handleModalClose();
	    return false;
	}
    });
    $('div.contrabandist_slots:not(.mwars_store)').droppable({
	accept: 'div.my_slots div.item',
	drop: function(event, ui) {
	    dontShowDragHelper = true;
	    $.modal().show('single').prepare({item:ui.draggable,action:'sell'});
	    handleModalClose();
	    return false;
	}
    });

    $("#inventar a").each(function() {
            $(this).removeClass("active");
            if($(this).attr('rel') == localStorage.getItem("activeTab")) {
                $(this).addClass("active");
                $(this).click();
            }
        });
});