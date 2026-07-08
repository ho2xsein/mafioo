$(function () {


    document.onkeydown = function () {
        switch (event.keyCode) {
            case 116 : //F5 button
                event.returnValue = false;
                event.keyCode = 0;
                return false;
            case 82 : //R button
                if (event.ctrlKey) {
                    event.returnValue = false;
                    event.keyCode = 0;
                    return false;
                }
        }
    }
    var $selectedItem = $();
    var clicked = false;
    function clearSelectedItem() {
        $('.inventory_highlight').removeClass('inventory_highlight');

        if ($selectedItem.length > 0) {
            $selectedItem.toggleClass('tapped', false);

            $('.ui-droppable').css({
                'z-index': 'auto'
            });

            $('.inventory-tip').unbind('click');

            $selectedItem.draggable('enable');

            $selectedItem = $();
        }
    }

    function highlightItem($item) {
        clearSelectedItem();

        $selectedItem = $item;
        $item.toggleClass('inventory_highlight tapped', true);

        $('.ui-droppable').css({
            'z-index': 1
        });

        $('.inventory-tip').bind('click', function (evt) {
            evt.preventDefault();
        });

        $selectedItem.draggable('disable');

        highlightDropTargets($item);
    }

    function highlightDropTargets($item) {
        if ($item.hasClass('iupgradeable')) {
            $('.iupgrade').toggleClass('inventory_highlight', true);
        }

        $('div.inventory_arms')
                .find('.' + $item.find('.json').jsonData()['class_wrap'])
                .toggleClass('inventory_highlight', true);
    }

    function dragHelper() {
        if ($selectedItem.length > 0) {
            clearSelectedItem();
        }

        $(this).find('.json').tooltip().unbind();
        var helper = $(this)
                .find('.json')
                .clone()
                .css({'-moz-box-shadow': '0px 0px 5px #000000', border: '1px solid #ffcc00'});

        $('body').append(helper);
        helper.maxZIndex();
        return helper;
    }

    function armItem($item) {
        $(".ui-draggable").draggable("disable");
        var invData = $item.find('.json').jsonData();
        if (invData.stackable == true) {
            var armData = $('div.inventory_arms')
                    .find('.' + invData['class_wrap'] + ' .json').jsonData();
            $.modal().show('inventory').prepare($item, armData, invData);
        } else {
            document.onkeydown = function () {
                switch (event.keyCode) {
                    case 116 : //F5 button
                        event.returnValue = false;
                        event.keyCode = 0;
                        return false;
                    case 82 : //R button
                        if (event.ctrlKey) {
                            event.returnValue = false;
                            event.keyCode = 0;
                            return false;
                        }
                }
            }
            window.location = '/inventory/arm/' + invData['id'] + '?' + REQ_PAIR;
        }
    }

    function disarmItem($item) {
        $(".ui-draggable").draggable("disable");
        var armData = $item.find('.json').jsonData();
        if (armData.stackable == true) {
            var invData = $('div.inventory_slots')
                    .find('.it' + armData['type_id'] + ' > .json').jsonData();
            $.modal().show('inventory').prepare($item, armData, invData);
        } else {
            document.onkeydown = function () {
                switch (event.keyCode) {
                    case 116 : //F5 button
                        event.returnValue = false;
                        event.keyCode = 0;
                        return false;
                    case 82 : //R button
                        if (event.ctrlKey) {
                            event.returnValue = false;
                            event.keyCode = 0;
                            return false;
                        }
                }
            }
            window.location = '/inventory/disarm/' + armData['type_id'] + '?' + REQ_PAIR;
        }
    }


    $('div.inventory_slots div.iarmable, div.inventory_slots div.icards').draggable({// :not(.icards-upgrade)
        revert: 'invalid',
        revertDuration: 100,
        helper: dragHelper,
        start: function () {
            clearSelectedItem();

            highlightDropTargets($(this));
        },
        stop: function () {
            clearSelectedItem();
        }
    }).click(function (evt) {
        if (($selectedItem.length > 0) && $selectedItem.is('.igun,.idog,.icar,.igrenade,.iuniq')) {
            evt.preventDefault();
            return;
        }

        highlightItem($(this));
    });

    $('div.inventory_arms_items').droppable({
        accept: 'div.inventory_slots div.iarmable',
        drop: function (event, ui) {
            if (clicked == false) {
                armItem(ui.draggable);
                clicked = true;
            }
            return false;
        }
    }).click(function () {
        if (($selectedItem.length > 0) && $selectedItem.is('div.inventory_slots div.iarmable')) {
            if (clicked == false) {
                armItem($selectedItem);
                clicked = true;
            }

        }
    });

    $('div.inventory_arms_items').find('.igun,.idog,.icar,.igrenade,.iuniq,.iconsumable').draggable({
        revert: 'invalid',
        revertDuration: 100,
        helper: dragHelper,
        start: function () {
            clearSelectedItem();

            if ($(this).hasClass('iupgradeable')) {
                $('.iupgrade').toggleClass('inventory_highlight', true);
            }

            $('div.inventory_slots').toggleClass('inventory_highlight', true);
        },
        stop: function () {
            if ($(this).hasClass('iupgradeable')) {
                $('.iupgrade').toggleClass('inventory_highlight', false);
            }

            $(this).find('.json').tooltip().bind();
            $('div.inventory_slots').toggleClass('inventory_highlight', false);
        }
    }).click(function () {
        var $clickedItem = $(this);
        var clickedItemData = $clickedItem.find('.json').jsonData();

        if ($selectedItem.length > 0) {
            var selectedItemData = $selectedItem.find('.json').jsonData();

            if (selectedItemData['group_id'] === clickedItemData['group_id']) {
                if (clicked == false) {
                    armItem($selectedItem);
                    clicked = true;
                }

                return;
            }
        }

        if (clickedItemData) {
            highlightItem($(this));

            $('div.inventory_slots').toggleClass('inventory_highlight', true);
        }
    });

    $('div.inventory_slots').droppable({
        accept: '.igun,.idog,.icar,.igrenade,.iuniq,.iconsumable',
        drop: function (event, ui) {
            if (clicked == false) {
                disarmItem(ui.draggable);
                clicked = true;
            }
        }
    }).click(function () {
        if (($selectedItem.length > 0) && $selectedItem.is('.igun,.idog,.icar,.igrenade,.iuniq,.iconsumable')) {
            if (clicked == false) {
                disarmItem($selectedItem);
                clicked = true;
            }
        }
    });

    $('div.inventory_arms_upgrade').droppable({
        accept: '.iupgradeable',
        drop: function (event, ui) {
            event.preventDefault();
            $.modal().show('upgrade').prepare(ui.draggable);
            clearSelectedItem();
        }
    }).click(function () {
        if (($selectedItem.length > 0) && $selectedItem.is('.iupgradeable')) {
            $.modal().show('upgrade').prepare($selectedItem);
        }
    });

    $('div.inventory_arms_cards').droppable({
        accept: '.icards',
        drop: function (event, ui) {
            event.preventDefault();
            $.modal().show('cards').prepare(ui.draggable);
            clearSelectedItem();
        }
    }).click(function () {
        if (($selectedItem.length > 0) && $selectedItem.is('.icards')) {
            $.modal().show('cards').prepare($selectedItem);
        }
    });

    $("#inventar a").each(function () {
        $(this).removeClass("active");
        if ($(this).attr('rel') == localStorage.getItem("activeTab")) {
            $(this).addClass("active");
            $(this).click();
        }
    });
});

function sortInventory() {
    $(".inventory_left").css("opacity", "0.3");
    $(".inventory_suggestion").css("opacity", "0.3");
    $("#savesort").css("opacity", "1");
    $("#sort").hide();
    $("#savesort").show();
    $("#sorttip").show();
    $(".jspPane").sortable('destroy');
    $(".jspPane").sortable();
    $(".ui-draggable").draggable('disable');
}

function sortInventorySave() {
    var data = $(".jspPane").sortable('toArray');
    $(".inventory_left").css("opacity", "1");
    $(".inventory_suggestion").css("opacity", "1");
    $("#sort").show();
    $("#savesort").hide();
    $("#sorttip").hide();
    $(".jspPane").sortable('disable');
    $(".ui-draggable").draggable('enable');
    $.post('/inventory/sort/?'+REQ_PAIR, {data : JSON.stringify(data),contentType : 'application/json'});
}