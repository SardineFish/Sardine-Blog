<?php
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
class PostDataEntity
{
    public $views;
    public $likes;
    public $comments;
}
class PostData
{
    public static function RegisterData(int $pid, SarMySQL $mysql = null)
    {
        if(!$mysql)
            $mysql = new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
            $result=$mysql->tryConnect();

            
        $sql = 
        "BEGIN; \n"
        ."SET @PID = '".$pid."'; \n"
        ."INSERT  \n"
        ."	INTO `post_data` (`index`, `pid`, `key`, `value`)  \n"
        ."	VALUES (NULL, @PID, 'browse', '0'); \n"
        ."INSERT  \n"
        ."	INTO `post_data` (`index`, `pid`, `key`, `value`)  \n"
        ."	VALUES (NULL, @PID, 'like', '0'); \n"
        ."INSERT  \n"
        ."	INTO `post_data` (`index`, `pid`, `key`, `value`)  \n"
        ."	VALUES (NULL, @PID, 'comment', '0'); \n"
        ."COMMIT;";
        $mysql->tryRunSQLM($sql);
    }
}
?>