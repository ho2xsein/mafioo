// GLOBALS
var mm_street = null;
var mm_header = null;
var mm_footer = null;

var MM_NOTHING = 0;
var MM_CITY = 1;
var MM_MY = 2;
var MM_MYGANG = 3;
var MM_ENEMY = 4;
var MM_FRIEND = 5;
var MM_OTHER = 6;

$(document).ready(function(){	
	//viewStreet(Math.floor(MINIMAP.w/2),Math.floor(MINIMAP.y/2));

	//$('<span id="mm_focus"></span>').appendTo('body');
	//$('<span id="mm_tooltip"></span>').appendTo('body');

	mm_street = $('#mm_street').get(0);
	mm_header = $('#mm_header').get(0);
	mm_footer = $('#mm_footer').get(0);
	viewStreet(Math.floor(MINIMAP.w/2),Math.floor(MINIMAP.h/2));
	
	var $minimap = $('#minimap');
	
	//minimap.css : line 361, 368
	var cellWidth = 16;
	var cellHeight = 16;
	
	var gridX, gridY;
	
	if (typeof G_vmlCanvasManager === 'undefined') {
	    drawMinimap($minimap);
	}
	
	$minimap.mousemove(function(evt) {
	    var pos   = $(this).offset();
	    var relX = evt.pageX - pos.left;
	    var relY = evt.pageY - pos.top;

	    var x = Math.floor(relX/cellWidth);
	    var y = Math.floor(relY/cellHeight);
	    
	    if ((x !== gridX) || (y !== gridY)) {
		if ((typeof gridX !== 'undefined') && (typeof gridY !== 'undefined')) {
		    //deselect
		    drawMapSquare($minimap, gridX, gridY, false);
		}
		
		if (MINIMAP.find_agent) {
		    drawAgentSearchHelper($minimap);
		}
		
		gridX = x;
		gridY = y;
		drawMapSquare($minimap, x, y, true);
	    } else {
		return;
	    }
	    
	    if ((MINIMAP.minimap[gridY])
	    && (MINIMAP.minimap[gridY][gridX])
	    && (MINIMAP.minimap[gridY][gridX]['map']['length'] > 0)
	    ) {
		var squareData = MINIMAP.minimap[gridY][gridX];
		var hasAgent = false;
		if (MINIMAP_AGENTS && MINIMAP_AGENTS[squareData.x] 
		&& (MINIMAP_AGENTS[squareData.x][squareData.y] == UID)
		) {
		    
		    hasAgent = true;
		}
		
		viewStreet(gridX, gridY, hasAgent);
	    }
	});
	
	$minimap.click(function() {
	    onMinimapClick(gridX, gridY);
	});
});

if (typeof G_vmlCanvasManager !== 'undefined') {
    //ie < 9 fix
    $(window).load(function() {
	drawMinimap($(minimap));
    });
}

function assertMinimapJs() { return 1; }
function getMinimapData() { return MINIMAP; }

function onMinimapClick(x, y) 
{ 
	var cell = MINIMAP.minimap[y][x];
	window.location = "/map/"+cell.x+"~"+cell.y;
}

function onNavigateClick(dx, dy) 
{ 
	var step = 5;
	window.location = "/minimap//"+(MINIMAP.x*1.0+dx*step)+"~"+(MINIMAP.y*1.0+dy*step);
}


function onMinimapMove(x, y, a) 
{ 


	/*
	var f = $('#mm_focus')[0];
	var t = $('#mm_tooltip')[0];
	var mmw = $('#mm_wrapper');
	var mmw_offset = mmw.offset();

	f.style.left = (mmw_offset.left + (16*x)) + 'px';
	f.style.top = (mmw_offset.top + (16*y)) + 'px';

	t.style.left = (mmw_offset.left + 30 + (16*x)) + 'px';
	t.style.top = (mmw_offset.top + (16*y)) + 'px';

	*/

	viewStreet(x, y, a);
}

function viewStreet(x,y,a)
{
	var cell = MINIMAP.minimap[y][x];
	var worldType = WORLD.split('.',1);

	if(cell.x == 0 && cell.y == 0)
	{
		mm_street.innerHTML = "<div class='map_city'> </div>";
		mm_header.innerHTML = getMapHeader(cell);
		mm_footer.innerHTML = getMapFooter(cell);
	}
	else
	{
		var html = '';
		for(var i=0; i<9; i++) {
			if(cell.type == 1) {
				html += "<div class='spot"+i+" bt bt"+cell.map[2*i]+"'><div class='obj_flag obj_"+cell.map[2*i+1]+"'> </div></div>";
			}
			else {
				if(cell.map[2*i] == -1) cell.map[2*i]=0;
				html += "<div class='spot"+i+" bt bt"+cell.map[2*i]+" bt-"+worldType+"'> </div>";
			}
		}
		//if(cell.agent > 0) {
		if(a) {
			html += "<div class='minimap_agent'> </div>";
		}
                
		var class_name = (cell.level>9)?'map_10':'map_09';
                if(cell.type === 3) {
                    class_name = "gang_09";
                }
		mm_street.innerHTML = "<div class='"+class_name+"'>"+html+"</div>";
		mm_header.innerHTML = getMapHeader(cell);
		mm_footer.innerHTML = getMapFooter(cell);
	}
}

function getMapHeader(cell)
{
	if (cell.title) {
	    var p = cell.title.split(':');
	} else {
	    var p = [];
	}
        
	if(p[0] == 'u') {
            var usr='';
            var path = StaticServer+'/srv/'+WORLD+'/avt/';
            if(p[2]) usr += "<td><img src='"+path+p[2]+".gif' alt='' class='avt'/></td><td>";
            if(p.length > 3) {
                // user
                    if(p[7]) usr += "<b class='"+p[8]+"'>"+p[7]+"</b> <b class='cc"+p[3]+"'> </b> <br/>";
                    if(p[4]) usr += "<span class='respect'>"+p[4]+"</span> <span class='level'>"+cell.level+"</span><br/>";
                    if(p[5]) usr += "<span class='victory'>"+p[5]+"</span><br/>";
                    if(p[6]) usr += "<span class='loss'>"+p[6]+"</span>";
            }
            else { // city
                    usr += "<b class='city'>"+p[1]+"</b>";
            }
            return "<table class='mm_header_table' cellpadding='0' cellspacing='2'><tr>"+usr+"</tr></table>";
        } 
        
        if(p[0] == 'g') {
            var gang='';
            var gpath = StaticServer+'/srv/'+WORLD+'/gavt/';
            if(p[2]) gang += "<td><img src='"+gpath+p[2]+".gif' alt='' class='avt'/></td><td>";
            if(p.length > 3) {
                    if(p[7]) gang += "<b class='gang'>"+p[1]+"</b> <b class='cc"+p[3]+"'> <br/>";
                    if(p[4]) gang += "<span class='respect'>"+p[4]+"</span> <b class='gang'> "+p[5]+" </b><br/>";
                    if(p[5]) gang += "<span class='victory'>"+p[6]+"</span> <span class='loss'>"+p[7]+"</span>";
            }
            else { // city
                    gang += "<td><img src='"+gpath+"0.gif' alt='' class='avt'/></td><td>";
                    gang += "<b class='gang'>"+p[1]+"</b>";
            }
            
            return "<table class='mm_header_table' cellpadding='0' cellspacing='2'><tr>"+gang+"</tr></table>";
        }
}

function getMapFooter(cell)
{
	var distance = Math.round(Math.max(1,Math.sqrt((cell.x-MINIMAP.me_x)*(cell.x-MINIMAP.me_x) + (cell.y-MINIMAP.me_y)*(cell.y-MINIMAP.me_y))));
	var attack_info = '';
	if(cell.type == 1) { //racket
		attack_info = 
			"<span class='racket_attack'>"+no2k(player_racket_distance_attack(MINIMAP.me_racket_attack, distance))+"</span> "+
			"<span class='racket_defence'>"+no2k(player_racket_distance_attack(MINIMAP.me_racket_defence, distance))+"</span> ";
	}
	var map_info = "<h2>"+
		"<span class='coords'>"+cell.x+":"+cell.y+"</span> "+
		"<span class='distance'>"+distance+"</span> "+
		attack_info +
		"</h2>";
	return map_info;
}

// php clone
function no2k(val)
{
	if(10000000000000 < val) return Math.round(val/1000000000000)+'T';
	if(10000000000 < val) return Math.round(val/1000000000)+'G';
	if(10000000 < val) return Math.round(val/1000000)+'M';
	if(10000 < val) return Math.round(val/1000)+'k';
	return Math.round(val);
}

MINIMAL_RACKET_FACTOR = 0.0001; 
function player_racket_distance_factor(distance)
{
	distance = Math.max(1,distance-1);
	return Math.max(MINIMAL_RACKET_FACTOR, -0.42*Math.log(distance)/Math.log(3) + 1);
}
function player_racket_distance_attack(attack, distance)
{
	var factor = player_racket_distance_factor(distance);
	if(factor <= MINIMAL_RACKET_FACTOR*1.1) return Math.min(100*1000, attack*factor);
	return attack*factor;
}


function drawMinimap($container) 
{
    var canvas = $container[0];
    var map = MINIMAP;
    var width = map.w;
    var height = map.h;
    
    canvas.width  = $container.width();
    canvas.height = $container.height();
    
    for (var y=0; y<height; y++) {
	for (var x=0; x<width; x++) {
	    drawMapSquare($container, x, y, false);
	}
    }
    
    if (map.find_agent) {
	drawAgentSearchHelper($container);
    }
}

function drawMapSquare($mapContainer, x, y, selected) 
{
    var canvas = $mapContainer[0];
    var map = MINIMAP;
    var minimapData = map.minimap;
    var squareData = minimapData[y][x];
    var userX = map.me_x;
    var userY = map.me_y;
    
    if (typeof G_vmlCanvasManager !== 'undefined') {
	G_vmlCanvasManager.initElement(canvas);
    }
    var ctx = canvas.getContext('2d');
    
    
    if (squareData['map']['length'] > 0) {
	var streetX = x * map['street_cell'];
	var streetY = y * map['street_cell'];

	ctx.fillStyle = '#000000';
	ctx.fillRect((streetX - 1), (streetY - 1), map['street_cell'], map['street_cell']);

	var streetPos = 0;
	while (streetPos < 9) {
	    var color = getRelationshipColor(squareData['map'][(streetPos * 2) + 1]) ;
	    if (color === '') {
		color = 'rgba(0, 0, 0, 0)';
	    }

	    var xOffset = (streetPos % 3) * map['building_size'];
	    var yOffset = (Math.floor(streetPos / 3)) * map['building_size'];

	    ctx.fillStyle = color;
	    ctx.fillRect((streetX + xOffset), (streetY + yOffset), map['building_size'], map['building_size']);

	    streetPos++;
	}
	
	if (selected) {
	    if ((squareData['x'] === userX) && (squareData['y'] === userY)) {
		ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
	    } else {
		ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
	    }
	    
	    ctx.fillRect((streetX - 1), (streetY - 1), map['street_cell'], map['street_cell']);
	}
    }
}

function getRelationshipColor(relationship) 
{
    switch (relationship) {
	case MM_NOTHING: {
	    return '';
	}
	
	case MM_CITY: {
	    return '#444444';
	}
	
	case MM_MY: {
	    return '#66cc00';
	}
	
	case MM_MYGANG: {
	    return '#0099cc';
	}
	
	case MM_ENEMY: {
	    return '#ff2200';
	}
	
	case MM_FRIEND: {
	    return '#9900cc';
	}
	
	case MM_OTHER: {
	    return '#ffaa00';
	}
	
	default: {
	    return '#ffffff';
	}
    }
}

function drawAgentSearchHelper($container) 
{
    var canvas = $container[0];
    var map = MINIMAP;
    
    if (typeof G_vmlCanvasManager !== 'undefined') {
	G_vmlCanvasManager.initElement(canvas);
    }
    var ctx = canvas.getContext('2d');
    
    var helperRadius = 4;//squares
    var helperDiameter = (2 * helperRadius) + 1;//squares
    var cornerRadius = 3;
    var gridX = Math.floor(map.w/2) - helperRadius;
    var gridY = Math.floor(map.h/2) - helperRadius;
    var rectX = (gridX * map['street_cell']) - (cornerRadius/2);
    var rectY = (gridY * map['street_cell']) - (cornerRadius/2);
    var squareSide = helperDiameter * map['street_cell'];
    
    for (var y=gridY; y<=(gridY+helperDiameter); y++) {
	for (var x=gridX; x<=(gridX+helperDiameter); x++) {
	    drawMapSquare($container, x, y, false);
	}
    }
    
    ctx.lineWidth = cornerRadius;
    ctx.fillStyle = 'rgba(0, 255, 51, 0.15)';
    ctx.strokeStyle = 'rgb(35, 179, 0)';
    
    roundRect(ctx, rectX, rectY, squareSide, squareSide, cornerRadius, true, true);
}

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
	stroke = true;
    }
    if (typeof radius === 'undefined') {
	radius = 5;
    }
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    if (stroke) {
	ctx.stroke();
    }
    
    if (fill) {
	ctx.fill();
    }
}