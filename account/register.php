<?php
session_start();
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Account.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $regUid=$_POST['uid'];
    $regPwd=$_POST['pwd'];
    $regLevel=$_POST['level'];
    $regEncryption=$_POST['encryption'];
    if(!preg_match("/^[^`,\"\']+$/",$regUid))
    {
        $response->msg="Username error.";
        $response->send();
    }
    if(!preg_match("/^[^`,\"\']+$/",$regPwd))
    {
        $response->msg="Password error.";
        $response->send();
    }
    if(Account::LevelInt($regLevel)<Account::LevelInt('default'))//check if require level is higher than deafault
    {
        $login=$_SESSION['login'];
        if(!$login)
        {
            $response->msg="You do not have permission.";
            $response->send();
        }
        $uid=$_SESSION['uid'];
        $checkResult=Account::CheckPermission($uid,Account::LevelInt($regLevel));
        if(!$checkResult->succeed)
        {
            $response->msg="Account checking error.";
            if(112510<$checkResult->errno)
                $response->msg=$checkResult->error;
            $response->send();
        }
    }
    $result=Account::Register($regUid,$regPwd,$regLevel,$regEncryption);
    if(!$result->succeed)
    {
        $response->msg="Account checking error.";
        if(1125110<$result->errno)
            $response->msg=$result->error;
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>