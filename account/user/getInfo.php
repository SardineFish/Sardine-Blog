<?php
require("Users.php");

define("ROOT",$_SERVER['DOCUMENT_ROOT']);
require_once ROOT."/lib/Utility.php";
$uid = array_key_exists("uid",$_GET)? $_GET['uid']:null;
$response = new Response();
if(!$uid)
{
    $response->error("Paramaters error.",1010100002);
}
try
{
    $response->send(Users::GetUser($uid));
}
catch(Exception $ex)
{
    $response->error($ex->getMessage(),$ex->getCode());
}
?>