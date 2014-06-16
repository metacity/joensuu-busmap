"use strict";

function JoensuuBusMap(gmap, options) {
	this.map = gmap;

	// Combine default and user-given settings
	this.settings = $.extend({
		showMarkers: true,
		apiEndPoint: "routeStops.php",
		routeColor: randomPastelColor
	}, options);

	// Assoc arrays for polylines and markers
	// Route ID works as the key, values are 
	// arrays of polylines or markers
	this.routePolylines = {};
	this.routeMarkers = {};
	
	this.routeTooltip = new google.maps.InfoWindow();
	
	
	function randomPastelColor() {
		var r = (Math.round(Math.random() * 150) + 80).toString(16);
		var g = (Math.round(Math.random() * 150) + 80).toString(16);
		var b = (Math.round(Math.random() * 150) + 80).toString(16);
		return '#' + r + g + b;
	}
}

JoensuuBusMap.prototype.drawRoutes = function(routes) {
	var self = this;
	self.clear();
	
	// Fetch route waypoints for each given route
	$.each(routes, function(i, route) {
		$.getJSON(self.settings.apiEndPoint + "?route_id=" + route.id, function(wayPoints) {
			generatePolylineAndMarkers(wayPoints,  route);
		});
	});
	
	// Iterates over the waypoints and generates arrays of google.maps.LatLng
	// and google.maps.Marker (if enabled) objects, stores them with the
	// route ID as the key, and puts on the map
	function generatePolylineAndMarkers(wayPoints, route) {
		var coordinates = [];
		var markers = [];

		$.each(wayPoints, function(i, wayPoint) {
			var latLng = new google.maps.LatLng(wayPoint.lat, wayPoint.lon);
			coordinates.push(latLng);

			var marker = new google.maps.Marker({
				position: latLng,
				title: wayPoint.name,
				icon: self.settings.markerIcon
			});
			if (self.settings.showMarkers === true) {
				marker.setMap(self.map);
			}
			markers.push(marker);
		});
		
		var polyline = new google.maps.Polyline({
			path: coordinates,
			geodesic: true,
			strokeColor: self.settings.routeColor(route.id),
			strokeOpacity: 0.75,
			strokeWeight: 6
		});
		polyline.setMap(self.map);
		google.maps.event.addListener(polyline, 'mouseover', function() {
			polyline.setOptions({strokeOpacity: 1.0});
		}); 
		google.maps.event.addListener(polyline, 'mouseout', function() {
			polyline.setOptions({strokeOpacity: 0.75}); 
		});
		google.maps.event.addListener(polyline, 'click', function(e) {
			if (self.routeTooltip.getMap()) {
				self.routeTooltip.close();
			}
			
			if (route.name) {
				self.routeTooltip.setContent('<div class="route-tooltip">' + route.name + '</div>');
				self.routeTooltip.open(self.map);
				self.routeTooltip.setPosition(e.latLng);
			}
		});
		
		// Save to assoc array
		self.routePolylines[route.id] = polyline;
		self.routeMarkers[route.id] = markers;
	}
};

JoensuuBusMap.prototype.clear = function() {
	// Clear markers
	$.each(this.routeMarkers, function(routeId, markers) {
		$.each(markers, function(i, marker) {
			marker.setMap(null);
		});
	});
	this.routeMarkers = {};
	
	// Clear polylines
	$.each(this.routePolylines, function(routeId, polyline) {
		polyline.setMap(null);
	});
	this.routePolylines = {};
};

JoensuuBusMap.prototype.markers = function(enabled) {
	var self = this;
	self.settings.showMarkers = (enabled === true ? true : false);

	$.each(this.routeMarkers, function(routeId, markers) {
		$.each(markers, function(i, marker) {
			marker.setMap(enabled === true ? self.map : null);
		});
	});
};


