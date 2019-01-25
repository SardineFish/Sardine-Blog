<?php
    require "Note.php";
    require $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
    require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
    require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
    header("Cache-Control: no-cache");
    require_once "../lib/Utility.php";
    $response=new Response();
    $page=$_GET['page'];
    $pid= array_key_exists('pid',$_GET)? $_GET['pid']:null;
    $count=$_GET['count'];
    if(!preg_match('/^[0-9]+$/',$pid))
        $pid="";
    if(!preg_match('/^[0-9]+$/',$page))
        $page=1;
    if(!$page)
        $page=1;
    $count=(int)$count;
    if(!is_int($count))
    {
        $count=10;
    }
    /*
    if($id!="")
        $sql = "select `id`,`title`,`tags`,`author`,`time`,`text` from `note` where `ignore` = 0 and `id` = ".$id;
    else
        $sql = "select `id`,`title`,`tags`,`author`,`time`,`text` from `note` where `ignore` = 0 order by `time` desc limit ".(($page-1)*$count).", ".($page*$count);*/
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->errorCode=3000000000;
        $response->msg="SQL Error.";
        $response->send();
    }
    if(!$mysql->connected)
    {
        $response->errorCode=3000000000;
        $response->msg="SQL Error.";
        $response->send();
    }
    if($pid!="")
    {
        $result = Note::Get($pid,$mysql);
        if(!$result->succeed)
        {
            if(1010204000<=$result->errno && $result->errno <=1010204999)
            {
                $response->errorCode=$result->errno;
                $response->msg = $result->error;
                $response->send();
            }
            else 
            {
                $response ->errorCode=((int)($result->errno /100000))*100000;
                $response ->msg = "Server error.";
                $response->send();
            }
        }
        $response->data=$result->data;
        $response->status ="^_^";
        $response->send();
    }
    else
    {
        $result = Note::GetList(($page-1)*$count,$page*$count,$mysql);
        if(!$result->succeed)
        {
            if(1010204000<=$result->errno && $result->errno <=1010204999)
            {
                $response->errorCode=$result->errno;
                $response->msg = $result->error;
                $response->send();
            }
            else 
            {
                $response ->errorCode=((int)($result->errno /100000))*100000;
                $response ->msg = "Server error.";
                $response->send();
            }
        }
        $response->data=$result->data;
        $response->status ="^_^";
        $response->send();
    }
?>