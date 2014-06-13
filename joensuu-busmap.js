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
	var i;
	for (i = 0; i < routes.length; ++i) {
		(function(idx) {
			$.getJSON(self.settings.apiEndPoint + "?route_id=" + routes[idx].id, function(wayPoints) {
				generatePolylineAndMarkers(wayPoints,  routes[idx]);
			});
		})(i);
	}
	
	// Iterates over the waypoints and generates arrays of google.maps.LatLng
	// and google.maps.Marker (if enabled) objects, stores them with the
	// route ID as the key, and puts on the map
	function generatePolylineAndMarkers(wayPoints, route) {
		var coordinates = [];
		var markers = [];

		var i;
		for (i = 0; i < wayPoints.length; ++i) {
			var wayPoint =  wayPoints[i];
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
		}
		
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
	var routeId;
	
	// Clear markers
	for (routeId in this.routeMarkers) {
		for (var i = 0; i < this.routeMarkers[routeId].length; ++i) {
			this.routeMarkers[routeId][i].setMap(null);
		}
	}
	this.routeMarkers = {};
	
	// Clear polylines
	for (routeId in this.routePolylines) {
		this.routePolylines[routeId].setMap(null);
	}
	this.routePolylines = {};
};

JoensuuBusMap.prototype.markers = function(enabled) {
	this.settings.showMarkers = (enabled === true ? true : false);

	var routeId;
	for (routeId in this.routeMarkers) {
		for (var i = 0; i < this.routeMarkers[routeId].length; ++i) {
			this.routeMarkers[routeId][i].setMap(this.settings.showMarkers === true ? this.map : null);
		}
	}
};


