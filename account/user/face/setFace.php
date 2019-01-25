<?php

define("ROOT",$_SERVER['DOCUMENT_ROOT']);
require "Face.php";
require ROOT."/account/Account.php";
require_once "../lib/Utility.php";
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