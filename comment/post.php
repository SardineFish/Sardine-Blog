<?php
error_reporting(E_ERROR);
define("DEBUG",true);
define("FUNCTION_ONLY",true);
session_start();
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Comment.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $name=$_POST['name'];
    $email=$_POST['email'];
    $text=$_POST['text'];
    $cid=$_POST['cid'];
    $url=$_POST['url'];
    try 
    {
        $pid=Comment::Post($cid,$text,$name,$email,$url);
        $response->data=$pid;
        $response->status ="^_^";
        $response->send ();
    }
    catch (Exception $ex)
    {
        $response->msg=$ex->getMessage();
        $response->errorCode=$ex->getCode();
        $response->send ();
    }
?>