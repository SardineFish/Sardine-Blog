<?php
require_once $_SERVER['DOCUMENT_ROOT']."/api/lib/Response.php";
require_once $_SERVER['DOCUMENT_ROOT']."/comment/Comment.php";
$uid = $_GET['uid'];
$response = new Response();
try
{
    if(!$uid)
        throw new Exception("Invalid pid", 1010100002);
    Comment::Unsubscribe($uid);
    $response->send($uid);
}
catch (Exception $ex)
{
    $response->error("Failed to update user data.", $ex->getCode());
}
?>