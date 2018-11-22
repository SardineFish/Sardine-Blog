<?php
session_start();
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Account.php";
    require $_SERVER['DOCUMENT_ROOT']."/account/token/Token.php";
    $uid=$_COOKIE['uid'];
    if(!preg_match("/^[^`,\"\']+$/",$uid))
    {
        echo ">_<";
        exit();
    }
    $result=Account::CheckLogin();
    if(!$result->succeed)
    {
        echo ">_<";
        if(DEBUG)
        {
            echo $result->errno.$result->error;
        }
        exit();
    }
    echo "^_^";
?>