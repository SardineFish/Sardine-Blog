<?php

require_once $_SERVER['DOCUMENT_ROOT']."/api/misc/DBHelper.php";

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
    public $root_pid;
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
    public static function FromSQLResult($data) : Comment
    {
        $comment = new Comment($data['cid'], $data['uid'], $data['name'], "");
        $comment->time=$data['time'];
        $comment->pid=$data['pid'];
        $comment->root_pid = $data['root_pid'];
        $comment->avatar = $data['icon'];
        $comment->url = $data["url"];
        $comment->text = Comment::Decode($comment->text);
        
        return $comment;
    }
    public static function Get($cid,$from,$count,$mysql=null)
    {
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
        $sql="SELECT `pid`,`cid`,`type`,`text`,`uid`,`time`,`root_pid` FROM `comment` WHERE `cid` = '".$cid."' and `ignore` = 0 ORDER BY `time` LIMIT ".$from.",".$count;
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
    public static function GetByPostId($pid,$mysql=null) : Comment
    {
        if(!$mysql)
            $mysql = DBHelper::Connect();
            
        $sql = 
            "SELECT comment.pid, comment.cid, comment.root_pid, comment.type, user_data.name, user_data.icon, user_data.url, comment.uid, comment.text, comment.time, like_data.value as `likes`, comment_data.value as `comments` "
            ."FROM comment  "
            ."JOIN user_data ON (user_data.uid = comment.uid AND user_data.ignore = 0 AND comment.ignore=0) "
            ."LEFT JOIN post_data like_data ON (like_data.pid = comment.pid AND like_data.key = 'like') "
            ."LEFT JOIN post_data comment_data ON (comment_data.pid = comment.pid AND comment_data.key = 'comment') "
            ."WHERE comment.pid='".$pid."' ";
        // $sql="SELECT `pid`,`cid`,`type`,`text`,`uid`,`time`,`root_pid` FROM `comment` WHERE `pid` = '".$pid."'";
        $result = $mysql->tryRunSQL($sql);

        if (count($result->data) <= 0)
            throw new Exception("Comment not found", 1010202001);
        
        return Comment::FromSQLResult($result->data[0]);
    }
    public static function GetList($cid,$from,$count,$time,$mysql=null)
    {
        if(!class_exists("PostData"))
            require_once $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
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

    public static function GetListByRootPid(int $pid, SarMySQL $mysql = null)
    {
        if(!class_exists("PostData"))
            require_once $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
        try 
        {
            $pid=(int)$pid;
            if(!$pid)
                throw new Exception ("The id cannot be empty or 0",1010100002);
                
            if(!$mysql)
                $mysql= DBHelper::Connect();
            
            $sql = 
            "SELECT comment.pid,comment.cid,comment.type,user_data.name,user_data.icon,user_data.url,comment.uid,comment.text,comment.time, like_data.value as `likes`, comment_data.value as `comments` "
            ."FROM comment  "
            ."JOIN user_data ON (user_data.uid = comment.uid AND user_data.ignore = 0 AND comment.ignore=0) "
            ."LEFT JOIN post_data like_data ON (like_data.pid = comment.pid AND like_data.key = 'like') "
            ."LEFT JOIN post_data comment_data ON (comment_data.pid = comment.pid AND comment_data.key = 'comment') "
            ."WHERE comment.root_pid='".$pid."' "
            . ((int)$time ? " AND comment.time < FROM_UNIXTIME(".(int)$time.") ":"")
            ."ORDER BY comment.time  ";

            $sqlResult=$mysql->runSQL($sql);
            if(!$sqlResult->succeed)
            {
                throw new Exception("SQL Error.",$sqlResult->errno);
            }
            $commentList = array();
            for($i=0;$i < count($sqlResult->data); $i++)
            {
                $data = $sqlResult->data[$i];
                $comment=new Comment($data['cid'],$data['uid'],urldecode($data['name']),$data['text']);
                $comment->time=$data['time'];
                $comment->pid=$data['pid'];
                $comment->avatar = urldecode($data['icon']);
                $comment->url = urldecode($data["url"]);
                $comment->text=Comment::Decode($comment->text);

                $commentCount = (int)$data['comments'];

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
        require_once $_SERVER['DOCUMENT_ROOT']."/api/account/Account.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/comment/Notify.php";

        $cid=(int)$cid;
        if(!$cid)
            throw new Exception ("The id cannot be empty or 0",1010100002);
        $text=Comment::Encode($text);

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();
        $user = UserInfo::Create($name, $email, $url);

        // Check account
        $user = AccountV3::SimpleAuth($user, $mysql);

        $uid = $user->uid;

        // Check cid
        $result = Posts::Get($cid,$mysql);
        if(!$result->succeed)
            throw new Exception ("The post does not existed.",1010204001);
        $replyUser = $result->uid;

        $root_pid = $cid;
        if ($result->type == PostType::Comment)
        {
            $comment = Comment::GetByPostId($cid, $mysql);
            $root_pid = $comment->root_pid;
        }

        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");
        
        //Get pid
        $pid=Posts::Add(PostType::Comment, $uid, $mysql);

        $sql = "INSERT INTO `comment` (`index`, `pid`, `cid`, `root_pid`, `uid`, `text`, `time`, `operate`, `ignore`) VALUES (NULL, '".$pid."', '".$cid."', '".$root_pid."', '".$uid."', \"".$text."\", '".$time."', 'created', '0');";
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

        // send Email notify
        try
        {
            $replyUserInfo = AccountV3::GetUserInfo($replyUser, $mysql);
            if ($replyUserInfo->email)
            {
                $viewUrl = Posts::GetURL($pid, $mysql);
                Notify::ReplyNotify(
                    $replyUserInfo->uid,
                    $replyUserInfo->email, 
                    "[Reply] A New Reply from ".$user->name,
                    $user->name,
                    $user->avatar,
                    $user->url,
                    $time,
                    $viewUrl,
                    $text
                );
            }
        }
        catch (Exception $ex)
        {

        }
        
            
        return $pid;
    }
}
?>