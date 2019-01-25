<?php
header('Cache-Control:no-cache,must-revalidate');   
header('Pragma:no-cache');   
header("Expires:0"); 

require "Comment.php";
require_once "../lib/Utility.php";
$response=new Response();
$cid=array_key_exists('cid',$_GET)? $_GET['cid']:null;
$time=array_key_exists('time',$_GET)? $_GET['time']:null;
$from=array_key_exists('from',$_GET)? $_GET['from']:null;
$count=array_key_exists('count',$_GET)? $_GET['count']:null;
try 
{
    $response->data=Comment::GetList($cid,$from,$count,$time);
    $response->status="^_^";
    $response->send();
}
catch (Exception $ex)
{
    $response->errorCode=$ex->getCode();
    $response->msg=$ex->getMessage();
    $response->send();
}
?>