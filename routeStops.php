<?php

require('init.php');

header('Content-Type: application/json; charset=utf-8');
routeStopsJSON($pdo, $_GET["route_id"]);

function routeStopsJSON($pdo, $route_id) {
	$fetchRouteStops = $pdo->prepare("SELECT name, lat, lon, route_order FROM kuopio_busline_routestops WHERE route_id = ? ORDER BY route_order ASC");
	$fetchRouteStops->bindParam(1, $route_id);
	if ($fetchRouteStops->execute()) {
		$routeStops = $fetchRouteStops->fetchAll(PDO::FETCH_ASSOC);

		// Convert to int/float, stupid PDO..
		foreach ($routeStops as &$stop) {
			$stop["lat"] = floatval($stop["lat"]);
			$stop["lon"] = floatval($stop["lon"]);
			$stop["route_order"] = intval($stop["route_order"]);
		}
		unset($stop);

		echo jsonRemoveUnicodeSequences($routeStops);
	} else {
		dieWithInternalError($pdo);
	}
}

?>