<?php

class PostDataEntity
{
    public $views;
    public $likes;
    public $comments;
}

class PostDataResult
{
    public $succeed;
    public $error;
    public $errno;
    public $data;
}

class PostData
{
    public static function Get($pid,$keys,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require "../lib/mysql/const.php";
            require "../lib/mysql/MySQL.php";
        }
        $pid=(int)$pid;
        $r=new PostDataResult();
        if(!$keys|| count($keys)<=0)
        {
            $r->error="Parameters error.";
            $r->errno=1010100002;
            return $r;
        }
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
        $sql = 'SELECT `pid`, sum(case when `key`=\''.$keys[0].'\' then `value` else 0 end) as `'.$keys[0].'`';
        for($i=1;$i<count($keys);$i++)
        {
            $sql.=', sum(case when `key`=\''.$keys[$i].'\' then `value` else 0 end) as `'.$keys[$i].'`';
        }
        $sql.=' FROM `post_data` WHERE `pid` = \''.$pid.'\' GROUP BY `pid`';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        if(count($result->data)<=0)
        {
            $r->errno=1010202001;
            $r->error="Post does not existed.";
            return $r;
        }
        $r->data=$result->data[0];
        $r->succeed=true;
        return $r;
    }

    public static function Set($pid,$key,$methor,$num,$create=false,$mysql=null)
    {
        $pid=(int)$pid;
        if(!class_exists("SarMySQL"))
        {
            require "../lib/mysql/const.php";
            require "../lib/mysql/MySQL.php";
        }
        if(!class_exists("Posts"))
        {
            require "../posts/Posts.php";
        }
        $r=new PostDataResult();
        if(!preg_match("/^[^`,\"\']+$/",$key))
        {
            $r->error="Parameters error.";
            $r->errno=1010100002;
            return $r;
        }
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
        //-------------------------------Check post existance-------------------------------
        $result=Posts::Get ($pid,$mysql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        
        //-------------------------------Data not existed-------------------------------
        $sql = 'SELECT * FROM `post_data` WHERE `pid`='.$pid.' and `key`=\''.$key.'\'';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        if(count($result->data)<=0)
        {
            if($create)
            {
                $v=0;
                if($methor=='+')
                    $v+=$num;
                else if($methor=='-')
                    $v-=$num;
                return PostData::Add ($pid,$key,$v,$mysql);
            }
            $r->error="Data does not exist.";
            $r->errno=1010202001;
            return $r;
        }
        //--------------------------------------------------------------
        $v=$result->data[0]['value'];
        if($methor=='+')
            $v+=$num;
        else if($methor=='-')
            $v-=$num;
        $sql='UPDATE `post_data` SET `value` = \''.$v.'\' WHERE `pid` = \''.$pid.'\' and `key` = \''.$key.'\';';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->data = $v;
        $r->succeed =true;
        return $r;
    }

    public static function Add($pid,$key, $value=0,$mysql=null)
    {
        $pid=(int)$pid;
        if(!class_exists("SarMySQL"))
        {
            require "../lib/mysql/const.php";
            require "../lib/mysql/MySQL.php";
        }
        if(!class_exists("Posts"))
        {
            require "../posts/Posts.php";
        }
        $r=new PostDataResult();
        if(!preg_match("/^[^`,\"\']+$/",$key))
        {
            $r->error="Parameters error.";
            $r->errno=1010100002;
            return $r;
        }
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

        //-------------------------------Check post existance-------------------------------
        $result=Posts::Get ($pid,$mysql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }

        //-------------------------------Check Data existance-------------------------------
        $sql = 'SELECT * FROM `post_data` WHERE `pid`='.$pid.' and `key`=\''.$key.'\'';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        if(count($result->data)>0)
        {
            $r->error="Data already existed.";
            $r->errno=1010202002;
            return $r;
        }
        
        //--------------------------------------------------------------
        $sql = 'INSERT INTO `post_data` (`index`, `pid`, `key`, `value`) VALUES (NULL, \''.$pid.'\', \''.$key.'\', \''.$value.'\');';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->data = $value;
        $r->succeed =true;
        return $r;
    }
}

class PostDataLike
{
    public static function Get($pid,$mysql=null)
    {
        $result = PostData::Get ($pid,array('like'),$mysql);
        if($result->succeed)
            $result->data=$result->data['like'];
        return $result;
    }

    public static function Add($pid,$addValue=1,$mysql =null)
    {
        $result = PostData::Set($pid, 'like','+',$addValue,true,$mysql);
        return $result;
    }
}

class PostDataBrowse
{
    public static function Get($pid,$mysql=null)
    {
        $result = PostData::Get ($pid,array('browse'),$mysql);
        if($result->succeed)
            $result->data=$result->data['browse'];
        return $result;
    }

    public static function Add($pid,$addValue=1,$mysql =null)
    {
        $result = PostData::Set($pid, 'browse','+',$addValue,true,$mysql);
        return $result;
    }
}

class PostDataComment
{
    public static function Get($pid,$mysql=null)
    {
        $result = PostData::Get ($pid,array('comment'),$mysql);
        if($result->succeed)
            $result->data=$result->data['comment'];
        return $result;
    }

    public static function Add($pid,$addValue=1,$mysql =null)
    {
        $result = PostData::Set($pid, 'comment','+',$addValue,true,$mysql);
        return $result;
    }
}