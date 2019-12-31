<?php
require_once "../lib/Response.php";
session_start();
$response = new Response();
$response->send($_SESSION["login"] && $_SESSION["uid"]);
?>