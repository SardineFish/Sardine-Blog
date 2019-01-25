<?php
session_start();
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "../all/edit.php";
    require "../account/Account.php";
    require "../token/Token.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $id=$_POST['id'];
    $name=$_POST['name'];
    $tags=$_POST['tags'];
    $detail=$_POST['detail'];
    $description=$_POST['description'];
    $summary=$_POST['summary'];
    $urlDownload=$_POST['urlDownload'];
    $type=$_POST['type'];
    $imgId=$_POST['imgId'];
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
    if(id==false)
    {
        $response->msg="All add error.";
        $response->send();
    }
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    //MySQL connect
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->msg="MySQL connecting error.";
        $response->send();
    }
    $sql='select `index`,`version` from `works` where `id`=\''.$id.'\' and `ignore` = 0';
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL runing error 1.";
        if($DEBUG)
            echo $result->error.
        $response->send();
    }
    if(count($result->data)<=0)
    {
        $response->msg="The id ".$id." note does not exist.";
        $response->send();
    }
    $version=$result->data[0]['version'];
    $index=$result->data[0]['index'];
    //check exist
    $sql="update `works` set `ignore` = 1 where `index` = ".$index;
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error2.";
        $response->send();
    }
    //insert new recode
    $sql = "insert into `works` (`index`, `id`, `name`, `version`, `author`, `tags`, `imgId`, `detail`, `description`, `summary`, `urlDownload`, `time`, `type`, `operate`, `ignore`) values (NULL, '".$id."', '".$name."', '".$version."', '".$uid."', '".$tags."', '".$imgId."', '".$detail."', '".$description."', '".$summary."', '".$urlDownload."', '".$time."', '".$type."', 'edited', '0');";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error3.";
        $response->send();
    }
    //edit all
    if(All_Edit($id,'works',$name,$tags,$description,$uid,$time)==false)
    {
        $response->msg="MySQL runing error 4.";
        if($DEBUG)
            echo $result->error.
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>