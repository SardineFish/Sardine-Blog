<?php
require"../lib/mysql/const.php";
require "../lib/mysql/MySQL.php";
require "Account.php";
require_once "../lib/Utility.php";
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