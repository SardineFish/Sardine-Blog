<?php
define("DEBUG",false);
    require "../../lib/mysql/const.php";
    require "../../lib/mysql/MySQL.php";
    require "Score.php";
    require_once "../lib/Utility.php";
    header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
    $response=new Response();
    $game=$_GET['game'];
    $page=$_GET['page'];
    $count=$_GET['count'];
    if(!$game||$game=="")
    {
        $response->msg="Parameters error.";
        $response->send();
    }
    if(!$page||$page=="")
        $page=1;
    if($count<0||$count=="")
        $count=10;
    $result=Score::Get($game,$page,$count);
    if(!$result->succeed)
    {
        $response->msg="Getting score error.";
        if(DEBUG)
            $response->msg.=$result->errno.$result->error;
        $response->send();
    }
    $response->data=$result->data;
    $response->status="^_^";
    $response->send();
?>