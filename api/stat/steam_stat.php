<?php
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
$url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=".STEAM_API_KEY."&steamid=".STEAM_ID."&format=json";

$context  = stream_context_create(array());
$response = file_get_contents($url, false, $context);
$stat = json_decode($response);
$stat = $stat->response;
$count = (int)$stat->game_count;
echo("[");
for ($i = 0; $i < $count; $i ++)
{
    if ($stat->games[$i]->playtime_forever <= 0)
        continue;
    $url = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=".STEAM_API_KEY."&appid=".$stat->games[$i]->appid;
    $response = json_decode(file_get_contents($url, false, $context));
    $stat->games[$i]->game_name = $response->game->gameName;
    echo(json_encode($stat->games[$i]));
    echo(", \r\n");
}
echo("]")
// echo(json_encode($stat));
?>