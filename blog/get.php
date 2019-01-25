<?php
header("Cache-Control: no-cache, must-revalidate");
require "Article.php";
require_once "../lib/Utility.php";
$response=new Response();
$pid=$_GET['pid'];
if((int)$pid == 404)
{
    http_response_code(404);
    $response->status=">_<";
    $response->errorCode=404;
    $response->error="Not Found";
    $response->send();
}
try
{
    $article = Article::Get($pid);
    $response->data=$article;
    $response->status="^_^";
    $response->send();
}
catch (Exception $ex)
{
    $response->errorCode=$ex->getCode();
    if($response->errorCode == 1010204001)
        http_response_code(404);
    $response->error = $ex->getMessage();
    $response->send();
}

?>