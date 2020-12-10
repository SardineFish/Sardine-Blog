<?php
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
$url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=".STEAM_API_KEY."&steamid=".STEAM_ID."&format=json&include_appinfo=1&include_played_free_games=1";

$context  = stream_context_create(array());
$response = file_get_contents($url, false, $context);

echo(json_encode($stat));
?>