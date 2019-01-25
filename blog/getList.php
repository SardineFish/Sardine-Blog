<?php
//try{
header("Cache-Control: no-cache, must-revalidate");
define("DEBUG",true );
require "Article.php";
require_once "../lib/Utility.php";
$response=new Response();
$time=$_GET['time'];
$from=$_GET['from'];
$count=$_GET['count'];
$preview=$_GET['preview'];
try
{
    //throw new Exception("233",233);
    $response->data=Article::getList($time,$from,$count,$preview);
    $response->status="^_^";
    $response->send();
}
catch(Exception $ex)
{
    $response->errorCode=$ex->getCode();
    $response->error=$ex->getMessage();
    $response->send();
}
?><?php

  ?>