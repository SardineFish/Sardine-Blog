<?php
require "PostData.php";
header("Cache-Control: no-cache");
define("DEBUG",true);
require_once "../lib/Utility.php";
$response=new Response();
$pid=(int)$_GET['pid'];
$keys=$_GET['keys'];
if(!$keys)
{
    $response ->msg ="Parameters error.";
    $response->errorCode =1010100002;
    $response->send();
}
$keys=json_decode($keys);
if(!is_array($keys) || !is_int($pid))
{
    $response ->msg ="Parameters error.";
    $response->errorCode =1010100002;
    $response->send();
}
$result=PostData::Get($pid,$keys);
if(!$result->succeed )
{
    if($result->errno==1010202001)
    {
        $response->data=array ();
        foreach($keys as $key)
        {
            $response->data[$key]=0;
        }
        $response->status ="^_^";
        $response->send ();
    }
    $response->msg="Error";
    if(DEBUG)
    {
        $response ->msg =$result->error;
        $response->errorCode =$result->errno;
    }
    $response->send ();

}
$response->data=$result->data;
$response->status ="^_^";
$response->send ();
?>