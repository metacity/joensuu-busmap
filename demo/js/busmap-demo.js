var joensuuBusMap;
var allLines = [];
var busLineList;

$(document).ready(function() {
	initializeMap();

	busLineList = $('#busline-list');
	
	$.getJSON("../lines.php", function(lines) {
		allLines = lines;

		// Generate and style the route checkboxes
		var routesHtml = '';
		
		$.each(lines, function(i, line) {
			routesHtml += '<h4>';
			if (line.line !== line.name) {
				routesHtml += '[' + line.line + '] ';
			}
			routesHtml += line.name + '</h4>';
			$.each(line.routes, function(j, route) {
				routesHtml += '<p><label><input type="checkbox" data-route-name="' + route.name + '" data-route-id="' + route.id + '">' + route.name + '</label><p>';
			});
			routesHtml += '<hr>';
		});
		busLineList.html(routesHtml);
		busLineList.find('input').iCheck({checkboxClass: "icheckbox_flat"}).on('ifToggled', function() {
			showCheckedLines();
		});
		
		$('#markers-toggle').iCheck({checkboxClass: "icheckbox_flat"}).on('ifToggled', function() {
			var isChecked = $(this).prop('checked');
			joensuuBusMap.markers(isChecked);
		});
	});
});

function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(62.6023831, 29.7922233),
		zoom: 12
	};
	var gmap = new google.maps.Map(document.getElementById("map"), mapOptions);
	joensuuBusMap = new JoensuuBusMap(gmap, {
		showMarkers: false, 
		markerIcon: "img/marker.png", 
		apiEndPoint: "../routeStops.php"
	});
}

function showCheckedLines() {
	var enabledRoutes = [];
	var checkBoxes = busLineList.find('input:checked').each(function() {
		enabledRoutes.push({id: $(this).data('route-id'), name: $(this).data('route-name')});
	});
	joensuuBusMap.drawRoutes(enabledRoutes);
}