<?php
//try{
    define("DEBUG",true );
    require "Works.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $time=$_GET['time'];
    $from=$_GET['from'];
    $count=$_GET['count'];
    try
    {
//throw new Exception("233",233);
        $response->data=Works::getList($from,$count,$time);
        $response->status="^_^";
        $response->send();
    }
    catch(Exception $ex)
    {
        $response->errorCode=$ex->getCode();
        $response->error=$ex->getMessage();
        $response->send();
    }
?>