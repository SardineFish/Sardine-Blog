<?php
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
class DBHelper
{
    public static function Connect() : SarMySQL
    {
        $mysql = new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();
        return $mysql;
    }
}
?>