<?php
/**
 *
 */
class Article
{
    public $pid;
    public $type;
    public $title;
    public $tags;
    public $docType;
    public $document;
    public $author;
    public $time;
    function __construct($title,$doc,$author,$time)
    {
        $this->pid=null;
        $this->type = ArticleType::Blog;
        $this->title=$title;
        $this->tags="";
        $this->docType=DocType::Text;
        $this->document=$doc;
        $this->author=$author;
        $this->time=$time;
    }
    public static function Encode($text,$encode)
    {
        if($encode==EncodeType ::Custom)
        {
            $text=str_replace("%","%25",$text);
            $text=str_replace("'","%27",$text);
            $text=str_replace ("\"","%22",$text);
            $text=str_replace ("\\","%5c",$text);
        }
        return $text;
    }
    public static function Decode($text,$encode)
    {
        if($encode==EncodeType ::Custom)
        {
            $text=str_replace("%27","'",$text);
            $text=str_replace ("%22","\"",$text);
            $text=str_replace ("%5c","\\",$text);
            $text=str_replace("%25","%",$text);
        }
        return $text;
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
            $pid=(int)$pid;
            if(!$pid)
                throw new Exception ("Invalid pid.",1010100002);
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
            $sql="SELECT `pid`,`type`,`title`,`tags`,`docType`, `encode`,`document`,`author`,`time` FROM `article` WHERE `pid`='".$pid."' ORDER BY `time` DESC LIMIT 0, 1";
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
            if(count($result->data)<=0)
                throw new Exception("Article not found.",1010204001);
            $data=$result->data[0];
            $article=new Article($data["title"],$data["document"],$data["author"],$data["time"]);
            $article->docType=$data["docType"];
            $article->pid=$data["pid"];
            $article->tags=explode(",", $data['tags']);
            $article->type=$data['type'];
            $article->title=Article::Decode($article->title,$data["encode"]);
            $article->tags=Article::Decode($article->tags,$data["encode"]);
            $article->document=Article::Decode($article->document,$data["encode"]);
            return $article;
        }
        catch(Exception $ex)
        {
            throw $ex;
        }
    }
    public static function GetList($time,$from,$count,$preview,$mysql=null)
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
            $count=(int)$count;
            $sql="SELECT `pid`,`type`,`title`,`tags`,`docType`, `encode`,`document`,`author`,`time` FROM `article` WHERE `time`< FROM_UNIXTIME(".$time.") AND `ignore` = 0 order by `time` desc limit ".$from.", ".$count;
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
            $articleList=array();
            for($i=0;$i < count($result->data);$i++)
            {
                $data=$result->data[$i];
                $article=new Article($data["title"],$data["document"],$data["author"],$data["time"]);
                $article->docType=$data["docType"];
                $article->pid=$data["pid"];
                $article->tags=explode(",", $data['tags']);
                $article->type=$data['type'];
                $article->title=Article::Decode($article->title,$data["encode"]);
                $article->tags=Article::Decode($article->tags,$data["encode"]);
                $article->document=Article::Decode($article->document,$data["encode"]);
                if($preview)
                {
                    if($article->docType==DocType::HTML)
                        $article->document = strip_tags($article->document);
                    $article->document=mb_substr($article->document,0,240);
                    
                }
                $articleList[$i]=$article;
            }
            return $articleList;
        }
        catch(Exception $ex)
        {
            throw $ex;
        }
    }
    
    public static function Post($article,$mysql=null)
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
        if(!class_exists("Account"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
        }
        if(!class_exists("PostData"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/postData/PostData.php";
        }
        try 
        {
            if(!is_a($article,"Article"))
            {
                throw new Exception ("Article required.",1010100002);
            }
            if(preg_match('/\S+/',$article->title)=="")
                throw new Exception ("Title cannot be empty.",1010100002);
            if(!$article->document)
                throw new Exception ("Document cannot be empty.",1010100002);
            if(!ArticleType::Check($article->type))
                throw new Exception ("Invalid type.",1010204102);
            if(!DocType::Check($article->docType))
                throw new Exception ("Invalid docType.",1010204102);
            
            date_default_timezone_set('PRC'); 
            $article->time=date("Y-m-d H:i:s");
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
            $checkResult=Account::CheckLogin($mysql);
            if(!$checkResult->succeed)
            {
                throw new Exception($checkResult->error,$checkResult->errno);
            }
            $article->author=$checkResult->account->uid;
            $checkResult=Account::CheckPermission($article->author,UserLevels::Admin,false,$mysql);
            if(!$checkResult->succeed)
            {
                throw new Exception($checkResult->error,$checkResult->errno);
            }

            $article->pid=Posts::Add(PostType::Article,$mysql);
            
            $article->title=Article::Encode($article->title,EncodeType::Custom);
            $article->tags=Article::Encode($article->tags,EncodeType::Custom );
            $article->document=Article::Encode($article->document,EncodeType::Custom);

            $sql = 'INSERT INTO `article`'
                .' (`index`, `pid`, `type`, `title`, `tags`, `docType`, `document`, `author`, `time`, `encode`, `operate`, `ignore`)'
                .' VALUES (NULL, \''.$article->pid
                .'\',\''.$article->type
                .'\', \''.$article->title
                .'\', \''.$article->tags
                .'\', \''.$article->docType
                .'\', \''.$article->document
                .'\', \''.$article->author
                .'\', \''.$article->time
                .'\', \'custom\', \'create\', \'0\');';
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
            //Add post data
            $addResult=PostDataBrowse::Add($article->pid,"0",$mysql);
            if(!$addResult->succeed)
            {
                throw new Exception("Browse statistics add error.",$result->errno);
            }
            $addResult=PostDataComment::Add($article->pid,"0",$mysql);
            if(!$addResult->succeed)
            {
                throw new Exception("Comment statistics add error.",$result->errno);
            }
            $addResult=PostDataLike::Add ($article->pid,0,$mysql);
            if(!$addResult->succeed)
            {
                throw new Exception("Like statistics add error.",$result->errno);
            }

            return $article;
        }
        catch(Exception $ex)
        {
            throw $ex;
        }
    }

    public static function Edit($article,$mysql = null)
    {
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/account/Account.php";

        date_default_timezone_set('PRC'); 
        $article->time=date("Y-m-d H:i:s");
        try
        {
            if(preg_match('/\S+/',$article->title)=="")
                throw new Exception ("Title cannot be empty.",1010100002);
            if(!$article->document)
                throw new Exception ("Document cannot be empty.",1010100002);
            if(!ArticleType::Check($article->type))
                throw new Exception ("Invalid type.",1010204102);
            if(!DocType::Check($article->docType))
                throw new Exception ("Invalid docType.",1010204102);

            $account = Account::CheckPermissionV2(UserLevels::Admin);
            $article->author = $account->uid;
            
            if(!$mysql)
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            $mysql->tryConnect();
            
            $sql='SELECT `index` FROM `article` WHERE `pid`=\''.$article->pid.'\' AND `ignore` = 0';
            $result = $mysql->tryRunSQL($sql);
            if(count($result->data)<=0)
                throw new Exception("Not found.",1010204001);

            $sql = "update `article` set `ignore`=1 where `pid`=".$article->pid." AND `ignore` = 0;";
            $mysql->tryRunSQL($sql);
            
            $article->title=Article::Encode($article->title,EncodeType::Custom);
            $article->tags=Article::Encode($article->tags,EncodeType::Custom );
            $article->document=Article::Encode($article->document,EncodeType::Custom);

            $sql = 'INSERT INTO `article`'
                .' (`index`, `pid`, `type`, `title`, `tags`, `docType`, `document`, `author`, `time`, `encode`, `operate`, `ignore`)'
                .' VALUES (NULL, \''.$article->pid
                .'\',\''.$article->type
                .'\', \''.$article->title
                .'\', \''.$article->tags
                .'\', \''.$article->docType
                .'\', \''.$article->document
                .'\', \''.$article->author
                .'\', \''.$article->time
                .'\', \'custom\', \'edit\', \'0\');';
            $result = $mysql->tryRunSQL($sql);
            return $article;
        }
        catch(Exception $ex)
        {
            throw $ex;
        }
    }
}
class ArticleType
{
    const Blog="blog";
    const Note="note";
    public static function Check($type)
    {
        if($type==ArticleType::Blog || $type==ArticleType::Note)
            return true;
        return false;
    }
}
class DocType
{
    const HTML="html";
    const MarkDown='markdown';
    const Text="text";
    public static function Check($docType)
    {
        if($docType == DocType::Text || $docType==DocType::HTML || $docType==DocType::MarkDown)
            return true;
        return false;
    }
}
class EncodeType
{
    const Base64="base64";
    const UrlEncode="urlEncode";
    const Custom="custom";
}