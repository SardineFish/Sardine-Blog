<?php
define(DEBUG,false);
require "Face.php";
$uid=$_GET["uid"];
if(!$uid)
    $uid=$_COOKIE["uid"];
if(!$uid||!preg_match("/^[^`,\"\']+$/",$uid))
{
    header("HTTP/1.1 303 See Other");
    header("Location: http://static.sardinefish.com/img/decoration/User_Default.png");
    exit();
}
try
{
    $result=Face::GetFace($uid);
    $url = $result->face;
    
    if(!$url||$url=='')
    {
        $url="http://static.sardinefish.com/img/decoration/User_Default.png";
    }
    
    header("HTTP/1.1 303 See Other");
    header("Location: ".$url);
}
catch(Exception $ex)
{
    header("HTTP/1.1 500 HTTP-Internal Server Error");
    if(DEBUG)
        echo $ex->getCode().":".$ex->getMessage();
    exit();
}
?>