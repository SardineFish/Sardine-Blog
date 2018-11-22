<?php
define("FUNCTION_ONLY",true);
define("DEBUG",true);
require "Note.php";
require $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
session_start();
class Response
{
    public $status=">_<";
    public $errorCode=0;
    public $msg="";
    function __construct()
    {
        $this->status=">_<";
        $this->errorCode=0;
        $this->msg="";
    }
    public function send()
    {
        echo json_encode($this);
        exit();
    }
}
$response=new Response();
try
{
    $title=$_POST['title'];
    $tags=$_POST['tags'];
    date_default_timezone_set('PRC'); 
    $time=date("Y-m-d H:i:s");
    $text=$_POST['text'];
    $result=Note::Post ($title,$tags,$text,$time);
    if(!$result->succeed )
    {
        $response->msg ="»ñÈ¡Ê§°Ü";
        if(DEBUG)
            $response->errorCode= $result->error;
        $response->send ();
    }
    $response->status ="^_^";
    $response->send ();
}
catch (Exception $e)
{
    $response->msg =$e->getMessage ();
    $response->errorCode = 1010100001;
    $response->send ();
}
?>