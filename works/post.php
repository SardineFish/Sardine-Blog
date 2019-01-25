<?php
    define("FUNCTION_ONLY",true);
    define("DEBUG",false);
session_start();
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "../all/add.php";
    require "../account/Account.php";
    require "../statistics/Statistics.php";
    require "../statistics/comment.php";
    require "../statistics/like.php";
    require "../statistics/browse.php";
    require "../token/Token.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $name=$_POST['name'];
    $tags=$_POST['tags'];
    $detail=$_POST['detail'];
    $description=$_POST['description'];
    $summary=$_POST['summary'];
    $urlDownload=$_POST['urlDownload'];
    $type=$_POST['type'];
    $imgId=$_POST['imgId'];
    $version=$_POST['version'];
    date_default_timezone_set('PRC'); 
    $time=date("Y-m-d H:i:s");
    //------------------------------Check For Login------------------------------
    $uid=$_COOKIE['uid'];
    if(!preg_match("/^[^`,\"\']+$/",$uid))
    {
        $response->msg="Please login.";
        $response->send();
    }
    $cResult=Account::CheckLogin($uid);
    if(!$cResult->succeed)
    {
        $response->msg="Please login.";
        if(DEBUG)
            $response->msg.=$cResult->errno.$cResult->error;
        $response->send();
    }
    //------------------------------------------------------------------------------------------
    if(preg_match('/\S+/',$name)=="")
    {
        $response->msg="Title cannot be empty.";
        $response->send();
    }
    $id=All_Add('works',$name,$tags,$description,$uid,$time);
    if(id==false)
    {
        $response->msg="All add error.";
        $response->send();
    }
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->msg="MySQL connecting error.";
        $response->send();
    }
    $sql = "INSERT INTO `works` (`index`, `id`, `name`, `version`, `author`, `tags`, `detail`, `description`, `summary`, `urlDownload`, `time`, `type`, `imgId`, `operate`, `ignore`) VALUES (NULL, '".$id."', '".$name."', '".$version."', '".$uid."', '".$tags."', '".$detail."', '".$description."', '".$summary."', '".$urlDownload."', '".$time."', '".$type."', '".$imgId."', 'created', '0');";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error";
        $response->send();
    }
    $addResult=Browse::Add('works',$id);
    if(!$addResult->succeed)
    {
        $response->msg="Browse statistics add error.";
        if(DEBUG)
        {
            $response->msg.=$addResult->error;
        }
        $response->send();
    }
    $addResult=Comment::Add('works',$id,0);
    if(!$addResult->succeed)
    {
        $response->msg="Comment statistics add error.";
        if(DEBUG)
        {
            $response->msg.=$addResult->error;
        }
        $response->send();
    }
    $addResult=Like::Add('works',$id,0);
    if(!$addResult->succeed)
    {
        $response->msg="Like statistics add error.";
        if(DEBUG)
        {
            $response->msg.=$addResult->error;
        }
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>