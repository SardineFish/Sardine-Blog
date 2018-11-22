<?php
define("DEBUG",true);
define("FUNCTION_ONLY",true);
session_start();
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Comment.php";
    class Response
    {
        public $status;
        public $msg;
        function __construct()
        {
            $this->status=">_<";
            $this->msg="";
        }
        public function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    $response=new Response();
    $name=$_POST['name'];
    $email=$_POST['email'];
    $text=$_POST['text'];
    $cid=$_POST['cid'];
    try 
    {
        $pid=Comment::Post($cid,$text,$name,$email);
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