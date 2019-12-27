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
    $title=$_POST['title'];
    $tags=$_POST['tags'];
    $text=$_POST['text'];
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
    //echo 'id='.$id."title=".$title."tags=".$tags."text=".$text;
    if(!$id)
    {
        $response->msg.="The id cannot be empty or 0.";
    }
    if(!preg_match('/\S+/',$title))
    {
        $response->msg.="The title cannot be empty.";
    }
    if(!preg_match('/\S+/',$tags))
    {
        $response->msg.="The tags cannot be empty.";
    }
    if(!preg_match('/\S+/',$text))
    {
        $response->msg.="The text cannot be empty.";
    }
    if($response->msg!="")
        $response->send();
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->msg="MySQL connecting error.";
        if(DEBUG)
            echo $result->error.
        $response->send();
    }
    $sql='select `index` from `note` where `id`=\''.$id.'\' and `ignore` = 0';
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL runing error 1.";
        if(DEBUG)
            echo $result->error.
        $response->send();
    }
    if(count($result->data)<=0)
    {
        $response->msg="The id ".$id." note does not exist.";
        $response->send();
    }
    $sql = "update `note` set `ignore`=1 where `id`=".$id." and `ignore` = 0;";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL runing error 2.";
        if(DEBUG)
            echo $result->error.
        $response->send();
    }
    $sql = "insert into `note` (`index`, `id`, `title`, `tags`, `text`, `author`, `time`, `operate`) values (NULL, ".$id.", '".$title."', '".$tags."', '".$text."', '".$uid."', '".$time."', 'edited')";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL runing error 3.";
        if(DEBUG)
            echo $result->error.
        $response->send();
    }
    if(All_Edit($id,'note',$title,$tags,$text,$uid,$time)==false)
    {
        $response->msg="MySQL runing error 4.";
        if(DEBUG)
            echo $result->error.
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>