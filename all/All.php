<?php 

class AllResult
{
    public $succeed;
    public $error;
    public $errno;
    public $data;
    function __construct()
    {
        $this->succeed=false;
        $this->error="";
        $this->errno=0;
    }
}
/**
 * All short summary.
 *
 * All description.
 *
 * @version 1.0
 * @author Sardi
 */
class All
{
    public static function Add($type,$title,$tags,$text,$author,$time)
    {
        $r=new AllResult();
        require "../lib/mysql/const.php";
        $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $connectResult=$mysql->connect();
        if(!$connectResult->succeed)
        {
            $r->succeed =false;
            $r->error=$connectResult->error;
            $r->errno=$connectResult->errno;
            return $r;
        }
        $sql = "INSERT INTO `all` (`index`, `id`, `type`, `title`, `tags`, `text`, `author`, `time`, `operate`, `ignore`) VALUES (NULL, '-1', '".$type."', '".$title."', '".$tags."', '".$text."', '".$author."', '".$time."', 'created', '0');";
        $result=$mysql->runSQL($sql);
        $id=$result->id;
        if(!$result->succeed)
        {
            $r->succeed =false;
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $id=$result->id;
        $sql = "UPDATE `all` SET `id` = '".$id."' WHERE `all`.`index` = ".$id.";";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->succeed =false;
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->id = $id;
        $r->succeed =true;
        return $r;
    }
    public static function GetLatest($from,$count,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require "../lib/mysql/const.php";
            require "../lib/mysql/MySQL.php";
        }
        $r=new AllResult ();
        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
        {
            $result=$mysql->connect();
            if(!$result->succeed)
            {
                $r->error=$result->error;
                $r->errno=$result->errno;
                return $r;
            }
        }
        $sql = 'SELECT `pid`as`pid`,\'note\'as`type`,`title`as`title`,`text`as`text`,`time`as`time` FROM `note` WHERE `pid` IN (SELECT `pid` FROM `posts` WHERE `type` = \'note\') AND `author` = \'SardineFish\' AND `ignore` = 0 UNION'
        . ' SELECT `pid`as`pid`,\'works\'as`type`,`name`as`title`,`description`as`text`,`time`as`time` FROM `works` WHERE `pid` IN (SELECT `pid` FROM `posts` WHERE `type` = \'works\') AND `ignore` = 0 UNION '
        . ' SELECT `pid`as`pid`,`type`as`type`,`title`as`title`,`document`as`text`,`time`as`time` FROM `article` WHERE `pid` IN (SELECT `pid` FROM `posts` WHERE `type` = \'article\') AND `ignore` = 0 '
        . ' ORDER BY `time` DESC '
        . ' LIMIT '.$from.','.$count;
        $result=$mysql->runSQL($sql);
        for($i=0;$i<count($result->data);$i++)
        {
            if($result->data[$i]['type']=='note')
                continue;
            $result->data[$i]["text"]=strip_tags($result->data[$i]["text"]);
            $result->data[$i]["text"]=mb_substr($result->data[$i]["text"],0,200);
        }
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->data = $result->data;
        $r->succeed =true;
        return $r;
    }
}