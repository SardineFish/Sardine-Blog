<?php

define("ROOT",$_SERVER['DOCUMENT_ROOT']);
require "Face.php";
require ROOT."/account/Account.php";
class Response
{
    public $status=">_<";
    public $errorCode=0;
    public $msg=0;
    public $data=null;
    public function send()
    {
        echo(json_encode($this));
        exit();
    }
}
$response = new Response();
$uid=$_POST["uid"];
$url=$_POST["url"];
$result = Face::ChangeFace ($uid,$url);
if(!$result->succeed )
{
    if(1010201000<=$result->errno && $result->errno <=1010203999)
    {
        $response->errorCode = $result->errno;
        $response ->msg= $result->error;
    }
    else 
    {
        $response->errorCode = (int)($result->errno /100000)*100000;
        $response->msg="Server Error.";
    }
    $response->send();
}
$response->status ="^_^";
$response->send();
?>