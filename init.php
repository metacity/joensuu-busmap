<?php

////////////////////////////////////
// CHANGE THE VALUES TO YOUR OWN
////////////////////////////////////
define("DB_DSN", "mysql:dbname=some_table_name;host=localhost");
define("DB_USERNAME", "your_db_username");
define("DB_PASSWORD", "your_db_password");

// Change these values if you want/need to..
define("LINES_TABLE", "kuopio_buslines");
define("ROUTES_TABLE", "kuopio_busline_routes");
define("ROUTESTOPS_TABLE", "kuopio_busline_routestops");


$pdo;
try {
	$pdo = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
} catch (PDOException $pdoex) {
	die("ERROR: Could not connect: " . $pdoex->getMessage());
}

function dieWithInternalError($pdo) {
	http_response_code(500);
	die(json_encode(array("error" => print_r($pdo->errorInfo()))));
}

function jsonRemoveUnicodeSequences($struct) {
	return preg_replace("/\\\\u([a-f0-9]{4})/e", 
		"iconv('UCS-4LE','UTF-8',pack('V', hexdec('U$1')))", json_encode($struct));
}

?>