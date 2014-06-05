(function($) {
	$.fn.kuopioBussify = function(options) {

		// Combine default and user-given settings
		var settings = $.extend({
			routes: [{id: 18}, {id: 126}],
			zoom: 12,
			center: new google.maps.LatLng(62.8816551, 27.6579654),
			markers: true,
			apiEndPoint: "routeStops.php"
		}, options);

		// Init the map
		var map = new google.maps.Map(this.get(0), settings);

		// Assoc arrays for polylines and markers
		// Route ID works as the key, values are arrays of polylines or markers
		var routePolylines = {};
		var routeMarkers = {};

		// Fetch route waypoints for each given route
		$.each(settings.routes, function(index, route) {
			$.getJSON(settings.apiEndPoint + "?route_id=" + route.id, function(wayPoints) {
				generatePolylineAndMarkers(wayPoints, route.id);
			});
		});

		function randomPastelColor() {
			var r = (Math.round(Math.random() * 150) + 80).toString(16);
			var g = (Math.round(Math.random() * 150) + 80).toString(16);
			var b = (Math.round(Math.random() * 150) + 80).toString(16);
			return '#' + r + g + b;
		}

		// Iterates over the waypoints and generates arrays of google.maps.LatLng
		// and google.maps.Marker (if enabled) objects, stores them with the
		// route ID as the key, and puts on the map
		function generatePolylineAndMarkers(wayPoints, routeId) {
			var coordinates = [];
			var markers = [];

			$.each(wayPoints, function(idx, wayPoint) {
				var latLng = new google.maps.LatLng(wayPoint.lat, wayPoint.lon);
				coordinates.push(latLng);

				if (settings.markers === true) {
					var marker = new google.maps.Marker({
						map: map,
						position: latLng,
						title: wayPoint.name,
						icon: settings.markerIcon
					});
					markers.push(marker);
				}

			});

			routePolylines[routeId] = new google.maps.Polyline({
				path: coordinates,
				geodesic: true,
				strokeColor: randomPastelColor(),
				strokeOpacity: 1.0,
				strokeWeight: 4
			});
			routePolylines[routeId].setMap(map);

			routeMarkers[routeId] = markers;
		}

		// Return self, allow chaining..
		return this;
	};

}(jQuery));



