<?php
class NoteResult
{
    public $succeed;
    public $error;
    public $errno;
    public $data;
    public function __construct()
    {
        $this->succeed =false;
        $this->errno=0;
        $this->error="";
    }
}
/**
 *
 */
class Note
{
    public $pid;
    public $title;
    public $tags;
    public $text;
    public $author;
    public $time;
    function __construct($pid,$title,$tags,$text,$author,$time)
    {
        $this->pid=$pid;
        $this->title=$title;
        $this->tags=$tags;
        $this->text=$text;
        $this->author=$author;
        $this->time=$time;
    }
    public static function Get($pid,$mysql=null)
    {
        try 
        {
            if(!class_exists("SarMySQL"))
            {
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            }
            $r=new NoteResult ();

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

            $sql="SELECT `pid`,`title`,`tags`,`text`,`author`,`time` FROM `note` WHERE `pid` = '".$pid."' and `ignore` = 0";
            $result = $mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error=$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            if(count($result->data)<=0)
            {
                $r->errno =1010204001;
                $r->error = "Note didn't exist.";
                return $r;
            }
            $data=$result->data[0];
            $pid=$data['id'];
            $title=$data['title'];
            $tags=$data['tags'];
            $text=$data['text'];
            $author=$data['author'];
            $time=$data['time'];
            $r->data=new Note($pid,$title,$tags,$text,$author,$time);
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            return false;
        }
    }
    public static function Post($title,$tags,$text,$time)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        if(!class_exists("Posts"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/posts/Posts.php";
        }
        if(!class_exists("PostData"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
        }
        if(!class_exists("Account"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
        }
        $r=new NoteResult ();
        try 
        {
            $author=$_COOKIE['uid'];
            $cResult=Account::CheckLogin();
            if(!$cResult->succeed)
            {
                $r->error="Please login.";
                $r->errno=1010201008;
                return $r;
            }

            if(preg_match('/\S+/',$title)=="")
            {
                $r->error="Title cannot be empty.";
                return $r;
            }
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);        
            $result=$mysql->connect();
            if(!$result->succeed)
            {
                $r->error=$result->error;
                $r->errno =$result->errno;
                return $r;
            }

            $pid = Posts::Add ('note',$mysql);

            /*$id=All_Add("note",$title,$tags,$text,$uid,$date);
            $allAddResult = All::Add ("note",$title,$tags,$text,$author,$time);
            $id=$allAddResult ->id;
            if(!$allAddResult->succeed)
            {
            $r->error="Add all error.";
            return $r;
            }*/

            $sql = "INSERT INTO `note` (`index`, `pid`, `title`, `tags`, `text`, `author`, `time`, `operate`) VALUES (NULL, ".$pid.", '".$title."', '".$tags."', '".$text."', '".$author."', '".$time."', 'created')";
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error.";
                return $r;
            }
            $addResult=PostDataBrowse::Add($pid,"0",$mysql);
            if(!$addResult->succeed)
            {
                $r->error="Browse statistics add error.".$result->error;
                $r->errno =$result->errno;
                return $r;
            }
            $addResult=PostDataComment::Add($pid,"0",$mysql);
            if(!$addResult->succeed)
            {
                $r->error="Comment statistics add error.".$result->error;
                $r->errno =$result->errno;
                return $r;
            }
            $addResult=PostDataLike::Add ($pid,0,$mysql);
            if(!$addResult->succeed)
            {
                $r->error="Like statistics add error.".$result->error;
                $r->errno =$result->errno;
                return $r;
            }
            $r->note =new Note ($pid,$title,$tags,$text,$author,$time);
            $r->succeed =true ;
            return $r;
        }
        catch (Exception $ex)
        {
            $r->error=$ex->getMessage();
            $r->errno =$ex->getCode();
            return $r;
        }
    }
    public static function GetList($from,$to,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        $r=new NoteResult ();

        $from=(int)$from;
        $to=(int)$to;
        if($to-$from<=0)
        {
            $r->succeed=true;
            $r->data=[];
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
        $sql = "select `pid`,`title`,`tags`,`author`,`time`,`text` from `note` where `ignore` = 0 order by `time` desc limit ".$from.", ".($to-$from);
        $result = $mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->succeed=true;
        $r->data=$result->data;
        return $r;
    }
}