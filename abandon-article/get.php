<?php
header("Cache-Control: no-cache, must-revalidate");
require "Article.php";
require_once "../lib/Utility.php";
$response=new Response();
$pid=$_GET['pid'];
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
    $response->error = $ex->getMessage();
    $response->send();
}

?>