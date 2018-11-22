<?php
    function All_Add($type,$title,$tags,$text,$author,$time)
    {
        require "../lib/mysql/const.php";
        $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $connectResult=$mysql->connect();
        if(!$connectResult->succeed)
        {
            return false;
        }
        $sql = "INSERT INTO `all` (`index`, `id`, `type`, `title`, `tags`, `text`, `author`, `time`, `operate`, `ignore`) VALUES (NULL, '-1', '".$type."', '".$title."', '".$tags."', '".$text."', '".$author."', '".$time."', 'created', '0');";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            return false;
        }
        $id=$result->id;
        $sql = "UPDATE `all` SET `id` = '".$id."' WHERE `all`.`index` = ".$id.";";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            return false;
        }
        return $id;
    }
?>