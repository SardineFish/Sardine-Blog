<?php
require_once $_SERVER['DOCUMENT_ROOT']."/posts/Posts.php";
require_once $_SERVER['DOCUMENT_ROOT']."/api/lib/Response.php";

$response = new Response();
$pid = (int)$_GET['pid'];
if (!$pid)
    $response->error("Invalid arguments", 1010100002);

try
{
    $url = Posts::GetURL($pid);

    $response->send($url);
}
catch(Exception $ex)
{
    $response->error("Internal error", $ex->getCode());
}

?>