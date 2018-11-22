<?php
require"../lib/mysql/const.php";
require "../lib/mysql/MySQL.php";
require "Account.php";
class Response
{
    public $status;
    public $msg;
    public $data;
    public $errorCode;
    function __construct()
    {
        $this->errorCode=0;
        $this->status=">_<";
        $this->msg="";
        $this->data=false;
    }
    public function send()
    {
        echo json_encode($this);
        exit();
    }
    
}
$uid=$_GET["uid"];
$response=new Response ();
$result = Account::CheckUid($uid);
if(!$result->succeed)
{
    $response->msg=$result->error;
    $response->status="^_^";
    $response->data=false;
    $response->errorCode = $result->errno;
    $response->send();
}
$response->status="^_^";
$response->data=true;
$response->send ();

?>