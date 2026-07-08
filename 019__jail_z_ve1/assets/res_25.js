var msg_cnt = 0;
var max_msg_cnt = 100;
var instance_id = 0;
var scheduledRequest;
var scheduleOffline;
var stopReconnect = false;
var tcpConnection = false;
var NOT_SET = -999999999;
var livechatRMenu = false;
if ($("#livechatRMenu").html()) {
    var livechatRMenu = true;
}
var filteredUsers = new Array();

function getFlashMovie(movieName) 
{
    var name = navigator.appName;
    var isIE = (name.indexOf("Microsoft") !== -1);
    return (isIE) ? document.getElementById(movieName) : document[movieName];
}

function prepareCmd(cmd)
{
    return encodeURIComponent(JSON.stringify(cmd) + "\n");
}

function sendRequest(cmd)
{
    clearTimeout(scheduledRequest);
    if (tcpConnection === false) {
        $.getJSON(serverUrl+"?cmds="+cmd+"&callback=?", chatHttpCallback);
    }
}


function chatHttpCallback(data)
{
    processHttpBulkCommands(decodeURIComponent(data));

    if (stopReconnect === false && tcpConnection === false) {
        scheduledRequest = setTimeout("sendRequest(composeSessId());", 1000);
        clearTimeout(scheduleOffline);
        scheduleOffline = setTimeout("offlineLight();", 8000);
    }
}
//---------------------------------------------------------------------------------------------------------------

function jsConnect()
{
    if (tcpConnection === false) {
        httpConnect();
    }
}

//called from action script
function flashConnect()
{
    tcpConnection = true;
    // console.log('connected');
    var msg = createSessIdCmd();
    var json_str = JSON.stringify(msg);
    var movie = getFlashMovie('rtchat');
    if (movie) {
        movie.sendCmd(json_str);
    }

    var msg_input = document.getElementById('_msg');
    if (msg_input) {
        msg_input.focus();
    }
    return 1;
}

function httpConnect()
{
    sendRequest(composeSessId());

    var msg_input = document.getElementById('_msg');
    if (msg_input) {
        msg_input.focus();
    }
}

function composeSessId()
{	
    return prepareCmd(createSessIdCmd());
}

function onConnect()
{
    //flashConnect()
}

function createSessIdCmd()
{
    if (instance_id === 0) {
        instance_id = new Date().getTime();
    }
    var msg = new Array(7);
    msg[0] = -10;
    msg[1] = app;
    msg[2] = getSessId();
    msg[3] = app_id;
    msg[4] = getLocId();
    msg[5] = mod;
    msg[6] = instance_id;
    return msg;
}

function getSessId() {
    return sess_id;
}

function getLocId() {
    return building_id;
}


var lastMessage = '';
var lastMessageTime = 0;
var liveChatBuildingId = 0;

$(document).ready(function () {
    if (1) {
        $("form[name=chatForm]").submit(function (e) {
            e.preventDefault();
             if (typeof liveChatBuildingId !== 'undefined') {
                 sendMsg(liveChatBuildingId);
             }
        });
    }
});

function sendMsg (building_id) {
    if (stopReconnect === false) {
        var msg_input = document.getElementById('_msg');
	if (msg_input) {
            var text = trim(msg_input.value);//alert(1);
            text = rmDuplicates(text);
            if (text.length <= 0) {
                // alert('141');
                return false;
            }
            if (unixTimestamp() - lastMessageTime < 2) {	 // less than 2 sec = flood preventer
                // alert('143');
                return false;
            }
            
            if (lastMessage === text) {
                if (unixTimestamp() - lastMessageTime < 3) { // less than 5 sec
                    msg_input.value = '';
                    // alert('151');
                    return false;
                }
            }

            lastMessage = text;
            lastMessageTime = unixTimestamp();

            if (text.length > 256) {
                text = text.substr(0, 256);
            }
            
            if (restrict_newbie && usr_level < restrict_newbie && GID < 100) {
                // alert('165');
                onInfo(no_chat_msg);
		/*
                    addChatLine("<div class='livechat-info'>"+no_chat_msg+"</div>", NOT_SET);
                    msg_input.value = '';
                    return false;
		*/
            } else {
                var msg = new Array(3);
		msg[0] = 20;
		msg[1] = building_id;
		msg[2] = text;
                
                if (tcpConnection) {
                    if (JSON) {
                        var json_str = JSON.stringify(msg);
                        
                        if (typeof emailConfirmed !== 'undefined' && emailConfirmed === 0) {
                            showModalWindow();
                            return false;
                        }
                        
                        var movie = getFlashMovie('rtchat');
                        if (movie) {
                            movie.sendCmd(json_str);
                        }
                    }
                } else {
                    sendRequest(composeSessId() + prepareCmd(msg));
                }
            }
            msg_input.value = '';
        }
    }
    return false;
}

function onError(txt) {
    addChatLine("<div class='livechat-error'>"+txt+"</div>", NOT_SET);
}

function onInfo(txt) {
    addChatLine("<div class='livechat-info'>"+txt+"</div>", NOT_SET);
}

function addChatLine(line, user_id) {
    var user_filtered = false;
    if (user_id !== NOT_SET) {
        for (x=0; x<filteredUsers.length; x++) {
            if (filteredUsers[x] === user_id) {
                user_filtered = true;
                break;
            }
        }
    }
    if (! user_filtered) {
        var chat_msgs = document.getElementById('chat-messages');
        // сървърът изпраща целия <div> и за да сработят нещата се налага да го сложа в нов и след това да го извадя от него и да го добавя където трябва
        if (chat_msgs) {
            var new_div = document.createElement('div');
            new_div.innerHTML = line;

			//check for developers
			var insideLink = new_div.getElementsByTagName('a');
			if (insideLink[0]) {
				if (insideLink[0].innerHTML === 'hellmare') {
					insideLink[0].className = 'dev-on';
					insideLink[0].title = insideLink[0].title.replace(/u:[^:]+:/i, 'u:DEVELOPER:');
				}
			}
			
            //chat_msgs.appendChild(new_div);
            var appended_div = new_div.getElementsByTagName('div')[0];
            if (appended_div) {
                chat_msgs.appendChild(appended_div);
                msg_cnt++;
                if (chat_msgs && msg_cnt > max_msg_cnt) {
                    var child = chat_msgs.firstChild;
                    removeLine(chat_msgs, child);
                }
            }
            $(document).ready(function () {
                if (TIME_FACTOR !== 4) {
                    var msg_container = $('#chat-messages');
                    var div_id = msg_container.children(':last').attr("id");
                    if (div_id) {
                        var span_for_change = $('#'+div_id+' span.gtrt');
                        if (span_for_change) {
                            span_for_change.text(print_chatline_time(span_for_change.attr("rel")));
                        }
                    }
                }
            });
        }
        return appended_div;
    } else {
        return null;
    }
}
/*
function tm_offset(unix_tm)
{
	var dt = new Date(unix_tm*1000);
	return dt.getTimezoneOffset();
}
*/
function print_chatline_daytime(rel)
{
    /*
    var full = window.location.host;
    var parts = full.split('.');
    if (parts[0]=='reidocrime' || parts[1]=='reidocrime') {
        var reidocrime_hour_patch = 3600;
    } else {
        var reidocrime_hour_patch = 0;
    }
    */

    rel = parseInt(rel);

    /*
    var a = tm_offset(GAME_START);
    var b = tm_offset(rel);
    rel = (rel + (a-b)*60)-reidocrime_hour_patch;
    */
    rel += DST_CORRECTION;
    var time_message = (rel-GAME_START)*TIME_FACTOR;
    var days = Math.floor(time_message/3600/24 ).toString();	
    var hours = Math.floor(((time_message-days*3600*24)/3600 )%24).toString();	
    var mins = Math.floor(((time_message-days*3600*24 - hours*3600)/60 )%60).toString();	
    if (hours.length == 1) hours = '0' + hours;
    if (mins.length == 1) mins = '0' + mins;
    var str = days + ' ' + hours + ':' + mins ;
    return str;
}

function print_chatline_time(rel)
{
    /*
    var full = window.location.host;
    var parts = full.split('.');
    if (parts[0]=='reidocrime' || parts[1]=='reidocrime') {
        var reidocrime_hour_patch = 3600;
    } else {
        var reidocrime_hour_patch = 0;
    }
    */

    rel = parseInt(rel);
    rel += DST_CORRECTION;
    var time_message = (rel-GAME_START)*TIME_FACTOR;
    var days = Math.floor(time_message/3600/24 ).toString();	
    var hours = Math.floor(((time_message-days*3600*24)/3600 )%24).toString();	
    var mins = Math.floor(((time_message-days*3600*24 - hours*3600)/60 )%60).toString();	
    if (hours.length == 1) hours = '0' + hours;
    if (mins.length == 1) mins = '0' + mins;
    var str = hours + ':' + mins ;
    return str;
}

function removeLine(container, child) {
    container.removeChild(child);
    msg_cnt--;
}

function onFlashMessage(str) {
    str = str.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%");
    processCmd(str);
}

var chat_users = new Array();

function addChatUser(username) {
    //if(!contains(chat_users,username))
    chat_users.push(username);
}

function deJSON(cmd_json) {
    console.log(cmd_json);
    try {
        return JSON.parse(cmd_json);
    } 
    catch (e) {
        if (1) {
            // console.log('An exception occurred in the script. Error name: ' + e.name + '. Error message: ' + e.message);
            // console.log(cmd_json);
        } else {
            alert('An exception occurred in the script. Error name: ' + e.name + '. Error message: ' + e.message);
            alert(cmd_json);
        }
        return null;
    }
}

function processHttpBulkCommands(cmd_json)
{
    cmdArray = deJSON(cmd_json);
    if (cmdArray == null) {
        return;
    }
    var cnt = 0;
    for (w = 0; w < cmdArray.length; w++) {
        if (stopReconnect) {
            break;
        }
        cnt++;
        if (cnt == 100) {
            //onInfo('cnt too big' + stopReconnect+ '; instance_id: '+instance_id + '; cmd: '+cmd);
            return;
        }
        processCmd(cmdArray[w]);
    }
}

function processCmd (cmd_json) {
    cmd = deJSON(cmd_json);
    if (cmd == null) {
        return;
    }        
	
    //if(cmd[0] == 20 && tcpConnection == true)
    //	alert(cmd);
    switch (cmd[0]) {
        case 20: { 	//CHAT ADD_LINE
			//cmd[2] - user_id
			//cmd[3] - chat message html
            var appended_div = addChatLine(cmd[3], cmd[2]);
            if (appended_div) {
                var a_arr = appended_div.getElementsByTagName('a');
                if (a_arr[0])
                    $(document).ready( function() {
                        $("#"+appended_div.id+" a").initTooltip({
                            containerClass: 'tooltip',
                            tooltipType:'avatar',
                            tooltipClass:'utip'
                        });
                        if (livechatRMenu) {
                            $("#"+appended_div.id+" a").contextMenu({
                                menu: 'livechatRMenu'
                            },  function(action, el, pos){
                                prepareRsend(action, el, pos);
                            });
                        }
                    });
                }
        break; }

        case 11: { //ADD_USER
            //cmd[2] - user_id
			//cmd[3] - user icon html
            if (document.getElementById('u_'+cmd[2]) == null) {
                var tmp_div = document.createElement('div');
                tmp_div.innerHTML = cmd[3];
                var vis = document.getElementById('vis');
                var new_user = tmp_div.getElementsByTagName('a')[0];
				
				//check for developers
				if (new_user.innerHTML === 'hellmare') {
					new_user.className = 'dev-on';
					new_user.title = link.title.replace(/u:[^:]+:/, 'u:DEVELOPER:');
				}
				
                if (vis) {
                    var inserted = false;
                    for (i=0; i<vis.childNodes.length; i++) {
                        var itm = vis.childNodes[i];
                        if (new_user.innerHTML.toLowerCase() < itm.innerHTML.toLowerCase()) {
                            vis.insertBefore(new_user, itm);
                            inserted = true;
                            break;
                        }
                    }
                    if (! inserted) {
                        vis.appendChild(new_user);
                    }
                    // vis.appendChild(tmp_div.getElementsByTagName('a')[0]);
                    // document.getElementById('vis').innerHTML += '<a id=\'u_'+cmd[2]+'\'>'+cmd[3]+'</a>';
                    $(document).ready( function() {
                        $("#vis a#u_"+cmd[2]).initTooltip({
                            containerClass: 'tooltip',
                            tooltipType:'avatar',
                            tooltipClass:'utip'
                        });
                        if (livechatRMenu) {
                            $("#vis a#u_"+cmd[2]).contextMenu({
                                menu: 'livechatRMenu'
                            },  function(action, el, pos){
                                prepareRsend(action, el, pos);
                            });
                        }
                    });
                    // console.log('u_'+cmd[2]);
                    addChatUser(stripHtml(cmd[3]));
                }
            }
        break; }
		
        case 10:	//REMOVE_USER
            removeElement('vis', cmd[2]);
        break;
		
	case 1:	//LOCATION
	{
            var j_chat = cmd[2];
            var lines_data_len = j_chat.length;
            var chat_msgs = document.getElementById('chat-messages');
            if (chat_msgs) {
				//изписвам съобщенията от чата
				for(i=0; i<lines_data_len; i+=2) {
					if(addChatLine(j_chat[i+1], j_chat[i]))
						msg_cnt++;
				}
			}

			//изписвам потребителите в залата
			var j_users = cmd[3];
			var user_info_lng = 2;
			var user_cnt = j_users.length / user_info_lng;
			var user_id_offset = 0;
			var uname_offset = 1;

			var vis = document.getElementById('vis');
			if (vis) {
				vis.innerHTML = ""; 
				var user_arr = new Array();
				
				for(i=0; i<user_cnt; i++) {
					var pos = i*user_info_lng;
					var usr = document.getElementById('u_'+j_users[pos]);					
					if (usr == null) {
						var user_name = j_users[pos + uname_offset];
						var tmp_div = document.createElement('div');
						tmp_div.innerHTML = user_name;

						var link = tmp_div.getElementsByTagName('a')[0];
						
						//check for developers
						if (link.innerHTML === 'hellmare') {
							link.className = 'dev-on';
							link.title = link.title.replace(/u:[^:]+:/, 'u:DEVELOPER:');
						}

						if (link.className.indexOf("-of") == -1)
							user_arr.push(link);

						addChatUser(stripHtml(user_name));
					}
				}
				user_arr.sort(cmp_users);
				for(i=0; i<user_arr.length; i++)
					vis.appendChild(user_arr[i]);
			}
			$(document).ready(function () {
				$("#vis a").initTooltip({
					containerClass: 'tooltip',
					tooltipType:'avatar',
					tooltipClass:'utip'
				});
				if(livechatRMenu){
					$("#vis a").contextMenu({
						menu: 'livechatRMenu'
					},  function(action, el, pos){
							prepareRsend(action, el, pos);
					});
				}
				$("#chat-messages a").initTooltip({
					containerClass: 'tooltip',
					tooltipType:'avatar',
					tooltipClass:'utip'
				});
				if(livechatRMenu){
					$("#chat-messages a").contextMenu({
						menu: 'livechatRMenu'
					},  function(action, el, pos){
							prepareRsend(action, el, pos);
					});
				}
			});
			//setInterval("sendChat();",200);
			//flash-ът светва с 'connected'
			if (tcpConnection == false) {
				var movie = getFlashMovie('rtchat');
				if (movie) {
					movie.connectedLight();
				}
			}

		break; }

		case 21: { //REMOVE_LINES
			var j_ids = cmd[2];
			var chat_msgs = document.getElementById('chat-messages');
			if (chat_msgs) {
				var remov_cnt = j_ids.length;
				var i;
				for (i=0; i<remov_cnt; i++) {
					var elem = document.getElementById(j_ids[i]);
					if (elem) {
						removeLine(chat_msgs, elem);
					}
				}
			}
		break; }

		case 22: { //CLEAR_CHAT
			var chat_msgs = document.getElementById('chat-messages');
			if (chat_msgs) {
				// трие се всичко
				chat_msgs.innerHTML = '';
				msg_cnt = 0;
			}
		break; }
            
		case -23: { //INFO
                    addChatLine("<div class='livechat-info'>"+cmd[2]+"</div>", NOT_SET);
		break; }
            
		case -11: { //REALOAD_PAGE
                    window.location.reload(true);
		break; }
            
		case -3: { //STOP_RECONNECT
                    stopReconnection();
                    onInfo(cmd[1]);
                break; }
            
		case -4: { //ACTIVE_INSTANCE_ID
                    // TODO: съобщение през locale че тази връзка е затворена
                    // сървъра казва коя инстанция е активната според него; ако тази не е активната, клиента се блокира
                    if (cmd[1] != instance_id) {
                        stopReconnection();
                        // onInfo("This connection is closed - from JS." + "stopReconnect: " + stopReconnect + '; instance_id: '+instance_id);
                        onInfo(cmd[2]);
                    }
                break; }
		default: {}
	}
}

function stopReconnection()
{
    stopReconnect = true;
    offlineLight();
}

function offlineLight()
{
    if (tcpConnection === false) {
        var movie = getFlashMovie('rtchat');
        if (movie) {
            movie.offlineLight();
        }
    }
}

function log(txt)
{
    try {
        dump(txt);
    }
    catch (e) {
        //alert(e);
    }
}

function cmp_users(a, b)
{
    if (a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase())
        return 1;
    else
        return -1;
}

function removeElement(parent_id, el_id)
{
    var par = document.getElementById(parent_id);
    var el = document.getElementById('u_'+el_id);
    if (par && el)
        par.removeChild(el);
}

function sendChat()
{
    document.getElementById('_msg').value = Math.random();
    sendMsg(-1107);
}

function wbr(str, num) 
{ 
    return str.replace(
        RegExp("(\\w{" + num + "})(\\w)", "g"), 
        function(all,text,char){return text + " " + char;}
    );
}

/*
function tagBreak(html, num) 
{ 
  return str.replace(
	RegExp(
		"(<[^>]+>[^<]+<\\/[^>]+>)(.*)", "g"), 
		function(all,text,char){return text + " " + char;}
  );
}
*/


var rxDoubledWords = /\b(\w+)((\s+)\1\b){3,}/g;
var rxDoubledChars = /([^\d\s])\1{4,}/g;
var rxDoubledDigits = /(\d)(\1{5})\1+/g;

/*
var rxDoubledChars = RegExp("([^\\d\\s])\\1\\1\\1\\1+", "g"); 
var rxDoubledDigits = RegExp("(\\d)(\\1\\1\\1\\1\\1)\\1+", "g"); 
var rxDoubledWords = RegExp("\\b(\\w+)((\\s+)\\1\\1\\b)+", "g"); 
*/
function rmDuplicates(str)
{
	//return str;
	str = str.replace(rxDoubledWords,'$1$3$1$3$1$3');
//	str = str.replace(rxDoubledChars,'$1');
//	str = str.replace(rxDoubledDigits,'$1$2');
	return wbr(str,20);

}

function unixTimestamp()
{
    return Math.round(new Date().getTime()/1000.0);
}


function stripHtml(html)
{
    return html.replace(/(<([^>]+)>)/ig,""); 
}

var oldMessage = '';
var oldMessageWord = '';
var oldGuessIndex = 0;
function chatKeyDown(e)
{
    var keynum;
    if (window.event) { // IE
        keynum = e.keyCode;
    }
    else if(e.which) { // Netscape/Firefox/Opera
        keynum = e.which;
    }

    var keychar = String.fromCharCode(keynum);

    // up-arrow
    if (keynum == 38) {
        var m = document.getElementById('_msg');
        if(!m) return false;
        m.value = lastMessage;
    }
    else if (keychar == "\t") {
        // seek words get near cursor one and make it to a username if possible
        // save it for later if tab is pressed once again to cycle users
        // replacesel('_msg', '%TAB%');
        //alert(chat_users[0]);
        var m = document.getElementById('_msg');
        if(!m) return false;

        var text_line = m.value;
        var words = text_line.split(/\W/);
        words.reverse();

        for (var i=0; i<chat_users.length; i++) {
            if (chat_users[i].toLowerCase().indexOf(words[0].toLowerCase()) == 0) {
                //replacesel('_msg', chat_users[i]);
                m.value = text_line.replace(/\b[\w]+$/, chat_users[i]);
                break;
            }
        }

        //m.focus();
        return false;
    }
}

function prepareRsend(action, el, pos) {
    var msgCommand = '';
    switch (action) {
        case 'unmute' : msgCommand = '/unmute ' + $(el).html() + ''; break;
	case 'mute30' : msgCommand = '/mute ' + $(el).html() + ' 0.5'; break;
	case 'mute1' : msgCommand = '/mute ' + $(el).html() + ' 1'; break;
	case 'mute2' : msgCommand = '/mute ' + $(el).html() + ' 2'; break;
	case 'mute24' : msgCommand = '/mute ' + $(el).html() + ' 24'; break;
	case 'mute168' : msgCommand = '/mute ' + $(el).html() + ' 168'; break;
	case 'clearmessages' : msgCommand = '/zap ' + $(el).html() + ''; break;
    }
    $("#_msg").val('').val(msgCommand);
    // var submitform = $("form[name=chatForm]").attr("onsubmit").replace('javascript:return ','');
    // jAlert(submitform);
    // eval(submitform);
    $("form[name=chatForm]").submit();
    // alert('prepareRsend ' + action + ' ' + el + ' ' + pos);
}
/*
function replacesel(oTextbox, sText)
{
	var isOpera = navigator.userAgent.indexOf("Opera") > -1;
	var isIE = navigator.userAgent.indexOf("MSIE") > 1 && !isOpera;
	var isMoz = navigator.userAgent.indexOf("Mozilla/5.") == 0 && !isOpera;

	oTextbox = document.getElementById(oTextbox);
	if(!oTextbox) return;

	oTextbox.focus();
	if(isIE){
		var oRange = document.selection.createRange();
		oRange.text = sText;
		oRange.collapse(true);
		oRange.select();
	}
	else //if (isMoz)
	{
		var iStart = oTextbox.selectionStart;
		oTextbox.value = oTextbox.value.substring(0, iStart) + sText + oTextbox.value.substring(oTextbox.selectionEnd, oTextbox.value.length);
		oTextbox.setSelectionRange(iStart + sText.length, iStart + sText.length);
	}
	oTextbox.focus();
}
*/


if (jQuery) (function () {
    
    $.extend($.fn, {
        contextMenu: function(o, callback) {
            // defaults
            if (o.menu == undefined) return false;
            if (o.inSpeed == undefined) o.inSpeed = 150;
            if (o.outSpeed == undefined) o.outSpeed = 75;
                // 0 needs to be -1 for expected results (no fade)
                if( o.inSpeed == 0 ) o.inSpeed = -1;
                if( o.outSpeed == 0 ) o.outSpeed = -1;
                // Loop each context menu
                $(this).each(function () {
                    var el = $(this);
                    el.oncontextmenu = function() {
                        return false;
                    }
                    var offset = $(el).offset();
                    // Add contextMenu class
                    $('#' + o.menu).addClass('contextMenu');
                    // Simulate a true right click
                    $(this).mousedown(function (e) {
                        var evt = e;
                        $(this).mouseup(function (e) {
                            var srcElement = $(this);
                            $(this).unbind('mouseup');
                            if (evt.button == 2) {
                                // Hide context menus that may be showing
                                $(".contextMenu").hide();
                                var rclickchatuser = $("#rclickchatuser");
                                rclickchatuser.html($(el).html());
                                rclickchatuser.attr("className",$(el).attr("className"));
                                rclickchatuser.css('margin','5px');
                                // Get this context menu
                                var menu = $('#' + o.menu);
                                if ($(el).hasClass('disabled')) return false;
							
                                // Detect mouse position
                                var d = {}, x, y;
                                if (self.innerHeight) {
                                    d.pageYOffset = self.pageYOffset;
                                    d.pageXOffset = self.pageXOffset;
                                    d.innerHeight = self.innerHeight;
                                    d.innerWidth = self.innerWidth;
                                } else if( document.documentElement &&
                                    document.documentElement.clientHeight ) {
                                    d.pageYOffset = document.documentElement.scrollTop;
                                    d.pageXOffset = document.documentElement.scrollLeft;
                                    d.innerHeight = document.documentElement.clientHeight;
                                    d.innerWidth = document.documentElement.clientWidth;
                                } else if( document.body ) {
                                    d.pageYOffset = document.body.scrollTop;
                                    d.pageXOffset = document.body.scrollLeft;
                                    d.innerHeight = document.body.clientHeight;
                                    d.innerWidth = document.body.clientWidth;
                                }
                                (e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
                                (e.pageY) ? y = e.pageY : x = e.clientY + d.scrollTop;

                                // Show the menu
                                $(document).unbind('click');
                                $(menu).css({ top: y, left: x }).fadeIn(o.inSpeed);
                                // Hover events
                                $(menu).find('A').mouseover( function() {
                                    $(menu).find('LI.hover').removeClass('hover');
                                    $(this).parent().addClass('hover');
                                }).mouseout( function() {
                                    $(menu).find('LI.hover').removeClass('hover');
                                });
                                
                                // keyboard
                                $(document).keypress( function(e) {
								switch( e.keyCode ) {
									case 38: // up
										if( $(menu).find('LI.hover').size() == 0 ) {
											$(menu).find('LI:last').addClass('hover');
										} else {
											$(menu).find('LI.hover').removeClass('hover').prevAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( $(menu).find('LI.hover').size() == 0 ) $(menu).find('LI:last').addClass('hover');
										}
									break;
									case 40: // down
										if( $(menu).find('LI.hover').size() == 0 ) {
											$(menu).find('LI:first').addClass('hover');
										} else {
											$(menu).find('LI.hover').removeClass('hover').nextAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( $(menu).find('LI.hover').size() == 0 ) $(menu).find('LI:first').addClass('hover');
										}
									break;
									case 13: // enter
										$(menu).find('LI.hover A').trigger('click');
									break;
									case 27: // esc
										$(document).trigger('click');
									break
								}
							});
							
							// When items are selected
							$('#' + o.menu).find('A').unbind('click');
							$('#' + o.menu).find('LI:not(.disabled) A').click( function() {
								$(document).unbind('click').unbind('keypress');
								$(".contextMenu").hide();
								// Callback
								if( callback ) callback( $(this).attr('href').substr(1), $(srcElement), {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );
								return false;
							});
							
							// hide bindings
							setTimeout( function() { // delay for mozilla
								$(document).click( function() {
									$(document).unbind('click').unbind('keypress');
									$(menu).fadeOut(o.outSpeed);
									return false;
								});
							}, 0);
						}
					});
				});
				
                    // disable text selection
                    if( $.browser.mozilla ) {
                        $('#' + o.menu).each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
                    } else if( $.browser.msie ) {
                        $('#' + o.menu).each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
                    } else {
                        $('#' + o.menu).each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
                    }
                    // disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
                    $(el).add('UL.contextMenu').bind('contextmenu', function() { return false; });

                });
                return $(this);
        },
		
        // disable context menu items on the fly
        disableContextMenuItems: function(o) {
            if (o == undefined) {
                // disable all
                $(this).find('LI').addClass('disabled');
                return( $(this) );
            }
            $(this).each( function() {
                if (o != undefined ) {
                    var d = o.split(',');
                    for (var i = 0; i < d.length; i++ ) {
                        $(this).find('A[href="' + d[i] + '"]').parent().addClass('disabled');

                    }
                }
            });
            return ($(this));
        },
		
        // enable context menu items on the fly
        enableContextMenuItems: function(o) {
            if (o == undefined) {
            // Enable all
            $(this).find('LI.disabled').removeClass('disabled');
            return( $(this) );
            }
            $(this).each(function () {
                if (o != undefined) {
                    var d = o.split(',');
                    for (var i = 0; i < d.length; i++ ) {
                        $(this).find('A[href="' + d[i] + '"]').parent().removeClass('disabled');
                    }
                }
            });
            return( $(this) );
        },
		
        // disable context menu(s)
        disableContextMenu: function() {
            $(this).each( function() {
                $(this).addClass('disabled');
            });
            return( $(this) );
        },
		
        // enable context menu(s)
        enableContextMenu: function() {
            $(this).each( function() {
                $(this).removeClass('disabled');
            });
            return( $(this) );
        },
		
        // destroy context menu(s)
        destroyContextMenu: function() {
            // destroy specified context menus
            $(this).each( function() {
                // disable action
                $(this).unbind('mousedown').unbind('mouseup');
            });
            return( $(this) );
        }
    });
    
    MafiaChat = {
        act:0,
        toggleChatScroll:function() {
            if ($('#chat-messages').attr('class') === "chat-messages") {
                $('#chat-messages').attr('class', "chat-messages-scroll");
            } else {
                $('#chat-messages').attr('class', "chat-messages");
            }
            return false;
        },
        toggle:function() {
            if (this.act) {
                $('#chat_fly').hide();
                this.act = 0;
                $.cookie('mcv', this.act);
            } else {
                $('#chat_fly').show();
                this.act = 1;
                $.cookie('mcv', this.act);
            }
        },
        init:function () {
            if (typeof $.cookie('mcv') === "undefined") {
                $.cookie('mcv', this.act);
            } else {
                this.act = parseInt($.cookie('mcv'));
            }
            if (this.act) {
                $('#chat_fly').show();
            }
            function fix_fly_position()
            {
                try {
                    var left = 0;
                    var top = 0;
                    var r = 0;
                    var o = $("#chat_fly");
                    var o1 = $('#facebook_fly');
                    var d = $(document);
                    var all = [f_clientWidth(), f_clientHeight()];
                            if ($.browser.msie) {
                                document.getElementById('fly_adv').style.position = 'fixed';
                                document.getElementById('fly_adv').style.bottom = 0;
                                document.getElementById('fly_adv').style.right = '8px';
                            } else {
                                o.css({'position':'fixed', 'bottom': 0});
                                o1.css({'position':'fixed', 'bottom':'34px'});
                            }
                } catch (e) {
                    // console.log(e);
                }
            }
            if ($.browser.msie) {
                window.onscroll = fix_fly_position;
            } else {
                $(window).scroll(fix_fly_position);
            }
            fix_fly_position();

            $(".emoicontip").mouseenter(function() {
                $('.emoicontip_panel').show();
            }).mouseleave(function() {
                $('.emoicontip_panel').hide();
            });
        }
    };
    // init
     //MafiaChat.init();
    
   if (0) {
       alert('done');
   }
})(jQuery);