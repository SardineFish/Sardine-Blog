<?php
class Works
{
    public $pid;
    public $type;
    public $name;
    public $tags;
    public $detail;
    public $description;
    public $news;
    public $urlDownload;
    public $author;
    public $time;
    public $icon;
    public $images;
    public $version;
    
    function __construct($pid,$type,$name)
    {
        $this->pid=$pid;
        $this->type=$type;
        $this->name=$name;
    }
    public static function Get($pid,$mysql=null)
    {

        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        try 
        {
            if(!$mysql)
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            if(!$mysql->connected)
            {
                $result=$mysql->connect();
                if(!$result->succeed)
                {
                    throw new Exception($result->error,$result->errno);
                }
            }
            $sql = 'SELECT * FROM `works` WHERE `pid` = '.$pid.' LIMIT 0, 1';
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
            if(count($result->data)<=0)
                throw new Exception("Work not found.",1010204001);
            $data=$result->data[0];
            $pid=$data['pid'];
            $type=$data['type'];
            $name=$data['name'];
            $version=$data['version'];
            $tags=$data['tags'];
            $detail=$data['detail'];
            $description=$data['description'];
            $urlDownload=$data['urlDownload'];
            $author=$data['author'];
            $time=$data['time'];
            $images=$data['images'];
            $news=$data['news'];
            $icon=$data['icon'];
            $work=new Works($pid,$type,$name);
            $work->version=$version;
            $work->tags=$tags;
            $work->icon=$icon;
            $work->author=$author;
            $work->detail=$detail;
            $work->description=$description;
            $work->images=$images;
            $work->news=$news;
            $work->urlDownload=$urlDownload;
            $work->time=$time;
            return $work;
        }
        catch(Exception $ex)
        {
            throw $ex->getMessage();
        }
    }
    public static function GetList($from,$count,$time,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        try 
        {
            if(!$mysql)
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            if(!$mysql->connected)
            {
                $result=$mysql->connect();
                if(!$result->succeed)
                {
                    throw new Exception($result->error,$result->errno);
                }
            }
            if(!$time)
                $time=time();
            $from=(int)$from;
            $to=(int)$to;
            if(!$to || $to<$from)
                $to=$from;
            $sql="SELECT `pid`,`type`,`name`,`version`,`author`,`tags`,`icon`,`time` FROM `works` WHERE `ignore` = 0 order by `time` desc limit ".$from.", ".$count;
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
            $workList=array(count($result->data));
            for($i=0;$i<count($result->data);$i++)
            {
                $data=$result->data[$i];
                $pid=$data['pid'];
                $type=$data['type'];
                $name=$data['name'];
                $version=$data['version'];
                $tags=$data['tags'];
                $author=$data['author'];
                $time=$data['time'];
                $icon=$data['icon'];
                $work=new Works($pid,$type,$name);
                $work->version=$version;
                $work->tags=$tags;
                $work->icon=$icon;
                $work->author=$author;
                $work->time=$time;
                $workList[$i]=$work;
            }
            return $workList;
        }
        catch(Exception $ex)
        {
            throw $ex;
        }
    }
    public static function Release($work,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        if(!class_exists ("Posts"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/posts/Posts.php";
        }
        try 
        {
            if(!$mysql)
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            if(!$mysql->connected)
            {
                $result=$mysql->connect();
                if(!$result->succeed)
                {
                    throw new Exception($result->error,$result->errno);
                }
            }
            if(!is_a($work,"Works"))
            {
                throw new Exception ("Works required.",1010100002);
            }
            if(!$work->name||$work->name=="")
            {
                throw new Exception("Name cannot be empty.",1010100002);
            }
            if(!WorksType ::Check($work->type))
            {
                throw new Exception ("Unknown Type.",1010100002);
            }
            if(!$work->author||$work->author=="")
            {
                throw new Exception ("Author required.",1010100002);
            }
            if(!$work->version||$work->version=="")
            {
                throw new Exception ("Version required.",1010100002);
            }
            $work->time=date("Y-m-d H:i:s");
            $work->pid=Posts::Add(PostType::Works,$mysql);
            $sql = 'INSERT INTO `works` '
                .' (`index`, `pid`, `name`, `version`, `author`, `tags`, `detail`, `description`, `images`, `news`, `urlDownload`, `time`, `type`, `icon`, `operate`, `ignore`) '
                .' VALUES (NULL, \''.$work->pid
                .'\', \''.$work->name
                .'\', \''.$work->version
                .'\', \''.$work->author
                .'\', \''.$work->tags
                .'\', \''.$work->detail
                .'\', \''.$work->description
                .'\', \''.$work->images
                .'\', \''.$work->news
                .'\', \''.$work->urlDownload
                .'\', \''.$work->time
                .'\', \''.$work->type
                .'\', \''.$work->icon
                .'\', \'created\', \'0\');';
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
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
}	
class WorksType
{
    const App="app";
    const Game="game";
    const Lib="lib";
    const Other="other";
    public static function Check($type)
    {
        if(!$type||$type==""||($type !=WorksType::App && $type!=WorksType::Game && $type !=WorksType::Lib && $type!=WorksType::Other))
        {
            return false;
        }
        return true;
    }
}