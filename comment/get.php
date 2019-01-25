<?php
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Comment.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    try 
    {
        $cid=$_GET['cid'];
        $page=$_GET['page'];
        $count=$_GET['count'];
        if(!$page)
            $page=1;
        if($count=='')
            $count=10;
        $count=(int)$count;
        if(!is_int($count))
        {
            $count=10;
        }
        $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $result=$mysql->connect();
        if(!$result->succeed)
        {
            $response->msg="MySQL connecting error.";
           if(DEBUG)
                $response->msg.=$result->error;
            $response->send();
        }
        $result=Comment::Get($cid,(($page-1)*$count),$count,$mysql);
        if(!$result->succeed)
        {
           if(DEBUG)
                $response->msg.=$result->error;
            $response->send();
        }
        $response->data=$result->comments;
        $response->status="^_^";
        $response->send();
    }
    catch(Exception $ex)
    {
        $response->msg="Server error.";
        if(DEBUG)
            $response->msg.=$ex->getMessage();
        $response->send();
    }
?>