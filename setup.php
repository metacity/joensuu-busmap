<?php

require("init.php");

define("LINES_API_URL", "http://bussit.joensuu.fi/bussit/web?command=stops&action=routes");
define("ROUTES_API_URL", "http://bussit.joensuu.fi/bussit/web?command=routes&action=by_line&format=json&line=");
define("ROUTESTOPS_API_URL", "http://bussit.joensuu.fi/bussit/web?command=olmap&action=getRouteStops&route=");

createTables($pdo);
fetchAndPopulateRoutes($pdo);

function createTables($pdo) {
	$buslinesCreated = $pdo->prepare("CREATE TABLE " . LINES_TABLE . "(
		id INT PRIMARY KEY AUTO_INCREMENT,
		line VARCHAR(15) NOT NULL,
		name VARCHAR(50)
		)")->execute();

	$routesCreated = $pdo->prepare("CREATE TABLE " . ROUTES_TABLE . "(
		id INT PRIMARY KEY AUTO_INCREMENT,
		name VARCHAR(255) NOT NULL,
		line_id INT NOT NULL,
		FOREIGN KEY(line_id) REFERENCES " . LINES_TABLE . "(id) ON DELETE CASCADE
		)")->execute();

	$routeStopsCreated = $pdo->prepare("CREATE TABLE " . ROUTESTOPS_TABLE . "(
		id INT PRIMARY KEY AUTO_INCREMENT,
		name VARCHAR(255) NOT NULL,
		lat FLOAT NOT NULL,
		lon FLOAT NOT NULL,
		route_order INT NOT NULL,
		route_id INT NOT NULL,
		FOREIGN KEY(route_id) REFERENCES " . ROUTES_TABLE . "(id) ON DELETE CASCADE
		)")->execute();

	if ($buslinesCreated && $routesCreated && $routeStopsCreated) {
		echo "Tables created successfully!\n";
	} else {
		die("Could not create all tables: " . print_r($pdo->errorInfo()));
	}
}

function fetchAndPopulateRoutes($pdo) {
	$insertLineStmt = $pdo->prepare("INSERT INTO " . LINES_TABLE . " (line, name) VALUES (?, ?)");
	$insertRouteStmt = $pdo->prepare("INSERT INTO " . ROUTES_TABLE . " (name, line_id) VALUES (?, ?)");
	$insertRouteStopStmt = $pdo->prepare("INSERT INTO " . ROUTESTOPS_TABLE . " (name, lat, lon, 
		route_order, route_id) VALUES (?, ?, ?, ?, ?)");

	// Monster loop, cba to refactor..
	$busLines = json_decode(file_get_contents(LINES_API_URL), true);
	foreach ($busLines as $line) {
		if (!empty($line["line"])) {
			$lineParams = array($line["line"], $line["name"]);
			if ($insertLineStmt->execute($lineParams)) {
				$lineRowId = $pdo->lastInsertId();
				$routes = json_decode(file_get_contents(ROUTES_API_URL . $line["id"]), true);
				foreach ($routes as $route) {
					if (!empty($route["name"])) {
						$routeParams = array($route["name"], $lineRowId);
						if ($insertRouteStmt->execute($routeParams)) {
							$routeRowId = $pdo->lastInsertId();
							$routeStops = json_decode(file_get_contents(ROUTESTOPS_API_URL . $route["id"]), true);
							foreach ($routeStops as $stop) {
								$stopParams = array($stop["name"], $stop["lat"], $stop["lon"], $stop["order"], $routeRowId);
								if ($insertRouteStopStmt->execute($stopParams)) {

								} else {
									die(print_r($pdo->errorInfo()));
								}
							}
						} else {
							die(print_r($pdo->errorInfo()));
						}
					}
				}
			} else {
				die(print_r($pdo->errorInfo()));
			}
		}
	}
	echo "Lines, routes and route stops downloaded and saved successfully!\n";
}

?>