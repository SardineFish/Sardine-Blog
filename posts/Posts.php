<?php

class PostResult
{
    public $succeed;
    public $error;
    public $errno;
    public $pid;
    public $type;
    public function __construct()
    {
        $this->succeed =false;
        $this->error="";
        $this->errno=0;
        $this->pid=-1;
        $this->type="";
    }
}

/**
 * Posts short summary.
 *
 * Posts description.
 *
 * @version 1.0
 * @author Sardi
 */
class Posts
{
    public static function Add($type,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require '../lib/mysql/const.php';
            require "../lib/mysql/MySQL.php";
        }
        //$r=new PostResult ();
        try 
        {
            if(!preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$type))
            {
                throw new Exception("Parameters error.",1010100002);
            }
            if(!PostType::Check($type))
            {
                throw new Exception("Unknown Type.",1010100002);
            }
            if(!$mysql)
                $mysql=new SarMySQL (HOST,UID,PWD,DB,PORT);
            if(!$mysql->connected)
            {
                $result=$mysql->connect();
                if(!$result->succeed )
                {
                    throw new Exception($result->error,$result->errno);
                }
            }
            $sql = 'INSERT INTO `posts` (`pid`, `type`) VALUES (NULL, \''.$type.'\');';
            $result=$mysql->runSQL ($sql);
            if(!$result->succeed )
            {
                throw new Exception($result->error,$result->errno);
            }
            return $result->id;
        }
        catch (Exception $ex)
        {
            throw $ex;
        }
    }

    public static function Get($pid,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require '../lib/mysql/const.php';
            require "../lib/mysql/MySQL.php";
        }
        $r=new PostResult ();
        $pid=(int)$pid;
        if(!$pid)
        {
            $r->error="Parameters error.";
            $r->errno=1010100002;
            return $r;
        }
        if(!$mysql)
            $mysql=new SarMySQL (HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
        {
            $result=$mysql->connect();
            if(!$result->succeed )
            {
                $r->error=$result->error;
                $r->errno=$result->errno;
                return $r;
            }
        }

        $sql='SELECT * FROM `posts` WHERE `pid`=\''.$pid.'\'';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed )
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        if(count($result->data)<=0)
        {
            $r->error="Post does not exist.";
            $r->errno=1010202001;
            return $r;
        }
        $r->pid=$result->data[0]['pid'];
        $r->type =$result->data[0]['type'];
        $r->succeed =true ;
        return $r;
    }
}

class PostType
{
    const News="news";
    const Comment="comment";
    const Note="note";
    const Works="works";
    const Article="article";
    const Lib="lib";
    public static function Check($type)
    {
        if(!preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$type))
        {
            return false;
        }
        if((!$type || $type=="") || ($type!=PostType::News && $type!=PostType::Comment && $type != PostType::Note && $type != PostType::Works && $type != PostType::Article && $type != PostType::Lib))
            return false;
        return true;
    }
}
