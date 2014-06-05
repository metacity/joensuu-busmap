<?php

$pdo;
try {
	$pdo = new PDO('YOUR_DSN_HERE', 'USERNAME', 'PASSWORD');
} catch (PDOException $pdoex) {
	die('ERROR: Could not connect: ' . $pdoex->getMessage());
}

function dieWithInternalError($pdo) {
	http_response_code(500);
	die(json_encode(array("error" => print_r($pdo->errorInfo()))));
}

function jsonRemoveUnicodeSequences($struct) {
	return preg_replace("/\\\\u([a-f0-9]{4})/e", "iconv('UCS-4LE','UTF-8',pack('V', hexdec('U$1')))", json_encode($struct));
}

?>