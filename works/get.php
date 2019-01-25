<?php
    define("DEBUG",true );
    require "Works.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $pid=$_GET['pid'];
    try 
    {
        $response->data=Works::Get($pid);
        $response->status="^_^";
        $response->send();
    }
    catch(Exception $ex)
    {
        $response->errorCode=$ex.getCode();
        $response->error=$ex.getMessage();
        $response->send();
    }
?>