<?php

require("init.php");

header("Content-Type: application/json; charset=utf-8");
allLinesJSON($pdo);

function allLinesJSON($pdo) {
	$fetchLines = $pdo->prepare("SELECT * FROM " . LINES_TABLE);
	$fetchRoutes = $pdo->prepare("SELECT id, name FROM " . ROUTES_TABLE . " WHERE line_id = ?");

	if ($fetchLines->execute()) {
		$busLines = $fetchLines->fetchAll(PDO::FETCH_ASSOC);
		foreach ($busLines as &$line) {
			if ($fetchRoutes->execute(array($line["id"]))) {
				$routes = $fetchRoutes->fetchAll(PDO::FETCH_ASSOC);
				$line["routes"] = $routes;
			} else {
				dieWithInternalError($pdo);
			}
		}
		unset($line);

		echo jsonRemoveUnicodeSequences($busLines);
	} else {
		dieWithInternalError($pdo);
	}
}

?>