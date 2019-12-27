<?php
class CommentResult
{
    public $succeed;
    public $error;
    public $errno;
    public $comments;
    public $pid;
}
/**
 * Comment short summary.
 *
 * Comment description.
 *
 * @version 1.0
 * @author Sardi
 */
class Comment
{
    public $pid;
    public $cid;
    public $uid;
    public $name;
    public $text;
    public $time;
    public function __construct(int $cid,string $uid,string $name,string $text)
    {
        $this->cid=$cid;
        $this->uid=$uid;
        $this->name=$name;
        $this->text=$text;
    }
    public static function Encode($text)
    {
        $text=str_replace("%","%25",$text);
        $text=str_replace("'","%27",$text);
        $text=str_replace ("\"","%22",$text);
        $text=str_replace ("\\","%5c",$text);
        return $text;
    }
    public static function Decode($text)
    {
        $text=str_replace("%27","'",$text);
        $text=str_replace ("%22","\"",$text);
        $text=str_replace ("%5c","\\",$text);
        $text=str_replace("%25","%",$text);
        return $text;
    }
    public static function Get($cid,$from,$count,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        $r=new CommentResult ();
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
        $sql="SELECT `pid`,`cid`,`type`,`text`,`uid`,`time` FROM `comment` WHERE `cid` = '".$cid."' and `ignore` = 0 ORDER BY `time` LIMIT ".$from.",".$count;
        $result = $mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->comments =$result->data;
        $r->succeed=true;
        return $r;
        
    }
    public static function GetByPostId($pid,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        $r=new CommentResult ();
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
        $sql="SELECT `pid`,`cid`,`type`,`text`,`uid`,`time` FROM `comment` WHERE `pid` = '".$pid."'";
        $result = $mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        
        $r->comments =$result->data;
        $r->succeed=true;
        return $r;
    }
    public static function GetList($cid,$from,$count,$time,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        if(!class_exists("PostData"))
            require $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
        try 
        {
            $cid=(int)$cid;
            $from=(int)$from;
            $count=(int)$count;
            if(!$cid)
                throw new Exception ("The id cannot be empty or 0",1010100002);
            /*if(!$time)
                $time=time();*/
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
            //$sql="SELECT `pid`,`cid`,`type`,`uid`,`text`,`time` FROM `comment` WHERE `time`< FROM_UNIXTIME(".$time.") AND `cid`='".$cid."' AND `ignore` = 0 ORDER BY `time` DESC LIMIT ".$from.", ".$count;

            // $sql = "SELECT comment.pid,comment.cid,comment.type,user_data.name,user_data.icon,user_data.url,comment.uid,comment.text,comment.time "
            //     . "FROM comment "
            //     . "INNER JOIN user_data "
            //     . "ON user_data.uid = comment.uid "
            //     . "	AND user_data.ignore = 0 "
            //     . "   AND comment.ignore=0 "
            //     . "WHERE comment.cid='".$cid."' "
            //     . ((int)$time ? " AND comment.time < FROM_UNIXTIME(".(int)$time.") ":"")
            //     . "ORDER BY comment.time "
            //     . "LIMIT ".$from.", ".$count;
            $sql = 
            "SELECT comment.pid,comment.cid,comment.type,user_data.name,user_data.icon,user_data.url,comment.uid,comment.text,comment.time, like_data.value as `likes`, comment_data.value as `comments` "
            ."FROM comment  "
            ."JOIN user_data ON (user_data.uid = comment.uid AND user_data.ignore = 0 AND comment.ignore=0) "
            ."LEFT JOIN post_data like_data ON (like_data.pid = comment.pid AND like_data.key = 'like') "
            ."LEFT JOIN post_data comment_data ON (comment_data.pid = comment.pid AND comment_data.key = 'comment') "
            ."WHERE comment.cid='".$cid."' "
            . ((int)$time ? " AND comment.time < FROM_UNIXTIME(".(int)$time.") ":"")
            ."ORDER BY comment.time  "
            ."LIMIT ".$from.", ".$count;
            $sqlResult=$mysql->runSQL($sql);
            if(!$sqlResult->succeed)
            {
                throw new Exception("SQL Error.",$sqlResult->errno);
            }
            $commentList=array();
            $subCommentCount =$count -  count($sqlResult->data);
            for($i=0;$i < count($sqlResult->data); $i++)
            {
                $data=$sqlResult->data[$i];
                $comment=new Comment($data['cid'],$data['uid'],urldecode($data['name']),$data['text']);
                $comment->time=$data['time'];
                $comment->pid=$data['pid'];
                $comment->avatar = urldecode($data['icon']);
                $comment->url = urldecode($data["url"]);
                $comment->text=Comment::Decode($comment->text);

                $commentCount = (int)$data['comments'];
                
                if($commentCount > 0 && $subCommentCount>0)
                {
                    $comment->comments = Comment::GetList($comment->pid,0,$subCommentCount,$time,$mysql);
                    $subCommentCount -= count($comment->comments);
                }

                $comment->like = (int)$data['like'];
                $commentList[$i]=$comment;
            }
            return $commentList;
        }
        catch (Exception $ex)
        {
            throw $ex;
        }
    }

    public static function Post($cid,$text,$name,$email,$url,$mysql=null)
    {
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/posts/Posts.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";

        $cid=(int)$cid;
        if(!$cid)
            throw new Exception ("The id cannot be empty or 0",1010100002);
        $text=Comment::Encode($text);

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();
        $account = null;

        // Check account
        try
        {
            $account = Account::CheckLoginV2($name,$mysql);
        }
        catch(Exception $ex)
        {
            if($ex->getCode()==1010201006)
            {
                $account = Account::QuickRegister($name,$email,$url,$mysql);
            }
            else
                throw $ex;
        }
        $uid = $account->uid;

        // Check cid
        $result = Posts::Get($cid,$mysql);
        if(!$result->succeed)
            throw new Exception ("The post does not existed.",1010204001);

        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");
        
        //Get pid
        $pid=Posts::Add("comment",$mysql);

        $sql = "INSERT INTO `comment` (`index`, `pid`, `cid`, `uid`, `text`, `time`, `operate`, `ignore`) VALUES (NULL, '".$pid."', '".$cid."', '".$uid."', \"".$text."\", '".$time."', 'created', '0');";
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);

        //init Post stat
        $result=PostDataLike::Add($pid,0,$mysql);
        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);
        $result=PostDataComment::Add($pid,0,$mysql);
        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);

        //Add post stat
        $result= PostDataComment::Add ($cid,1,$mysql);
        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);
            
        return $pid;
    }
}
?>