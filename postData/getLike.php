<?php
require "PostData.php";
header("Cache-Control:no-cache");
require_once "../lib/Utility.php";
$response=new Response ();
$pid = $_GET['pid'];
$result = PostDataLike::Get ($pid );
if(!$result->succeed )
{
    if($result->errno==1010202001)
    {
        $response->data =0;
        $response->status ="^_^";
        $response->send ();
    }
    $response->errorCode = $result->errno;
    $response ->msg =$result->error;
    $response->send ();
}
$response->data =$result->data ;
$response->status ="^_^";
$response->send ();
?>