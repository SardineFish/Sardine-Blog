<?php
//try{
header("Cache-Control: no-cache, must-revalidate");
define("DEBUG",true );
require "Article.php";
class Response
{
    public $status;
    public $errorCode;
    public $error;
    public $data;
    public $msg;
    function __construct()
    {
        $this->status=">_<";
        $this->error="";
        $this->errorCode=0;
        $this->data=null;
        $this->msg="";
    }
    public function send()
    {
        echo json_encode($this);
        exit();
    }
}
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