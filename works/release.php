<?php
require "Works.php";
require_once "../lib/Utility.php";
$response=new Response();
$type=$_POST['type'];
$name=$_POST['name'];
$version=$_POST['version'];
$author=$_POST['author'];
$icon=$_POST['icon'];
$tags=$_POST['tags'];
$description=$_POST['description'];
$detail=$_POST['detail'];
$images=$_POST['images'];
$news=$_POST['news'];
$urlDownload=$_POST['urlDownload'];
$work=new Works(0,$type,$name);
$work->version=$version;
$work->author =$author;
$work->icon=$icon;
$work->tags=$tags;
$work->description=$description;
$work->detail=$detail;
$work->images=$images;
$work->news=$news;
$work->urlDownload=$urlDownload;
try 
{
    Works::Release($work);
    $response->status="^_^";
    $response->send();
}
catch(Exception $ex)
{
    $response->error=$ex->getMessage();
    $response->errorCode=$ex->getCode ();
    $response->send();
}
?>