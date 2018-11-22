<?php
    function All_Delete($id,$type,$author,$time)
    {
        $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $connectResult=$mysql->connect();
        if(!$connectResult->succeed)
        {
            return false;
        }
        $sql=$sql = "update `all` set `ignore`=1 where `id`=".$id." and `ignore`=0";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            return false;
        }
        $sql = "INSERT INTO `all` (`index`, `id`, `type`, `title`, `tags`, `text`, `author`, `time`, `operate`, `ignore`) VALUES (NULL, '".$id."', '".$type."', '', '', '', '".$author."', '".$time."', 'deleted', '1');";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            return false;
        }
        return true;
    }
?>