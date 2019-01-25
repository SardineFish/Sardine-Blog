<?php
require "PostData.php";
header("Cache-Control:no-cache");
require_once "../lib/Utility.php";
$response=new Response ();
$pid = $_POST['pid'];
$result = PostDataLike::Add($pid );
if(!$result->succeed )
{
    $response->errorCode = $result->errno;
    $response ->msg =$result->error;
    $response->send ();
}
$response->data =$result->data ;
$response->status ="^_^";
$response->send ();
?>