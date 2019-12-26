<?php
require_once $_SERVER['DOCUMENT_ROOT']."/account/user/Users.php";
require_once "../postData/PostData.php";
class NoteEntity
{
    public $pid;
    public $text;
    public $time;
    public $author;
    public $postData;
}
class NoteBoard
{
    public static function Post($text, $name, $email, $url) : int
    {
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/posts/Posts.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/account/Account.php";

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();

        $uid = Account::SimpleLogin($name, $email, $url, $mysql);
        $pid = Posts::Add("note", $mysql);
        date_default_timezone_set('PRC'); 
        $time = date("Y-m-d H:i:s");
        $text = $mysql->escape($text);
        
        PostData::RegisterData($pid, $mysql);

        $sql = "INSERT INTO `note` (`index`, `pid`, `title`, `tags`, `text`, `author`, `time`, `operate`, `ignore`)"
        ."VALUES (NULL, '".$pid."', '', '', '".$text."', '".$uid."', '".$time."', 'created', '0');";

        $mysql->tryRunSQL($sql);

        return $pid;
    }
    public static function GetList($time, int $startIdx, int $count, bool $increaseViewCount, $mysql = null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        if(!$mysql)
            $mysql = new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
            $result=$mysql->tryConnect();

        if(!$time)
            $time = time();
        $startIdx = (int)$startIdx;
        $count = (int)$count;
        $time = (int)$time;
        
        $sql = "";

        if($increaseViewCount)
        {
            $sql = 
                "UPDATE post_data \n"
                ."SET value = value + 1 \n"
                ."WHERE post_data.key = 'browse' AND pid IN ( \n"
                ."    SELECT pid \n"
                ."    FROM note \n"
                ."    WHERE `ignore` = 0 \n"
                ."); \n";
            $mysql->tryRunSQL($sql);
        }
        $sql = 
            "SELECT note.pid, note.text, note.time, user_data.uid, user_data.name, user_data.icon as avatar, user_data.url, stat.view, stat.like, stat.comments \n"
            ."FROM note \n"
            ."JOIN user_data ON (note.author = user_data.uid AND user_data.ignore = 0) \n"
            ."JOIN ( \n"
            ."	SELECT x.pid, x.value as `view`, y.value as `like`, z.value as `comments` \n"
            ."	FROM post_data x \n"
            ."	JOIN post_data y ON (x.pid = y.pid AND y.key = 'like') \n"
            ."	JOIN post_data z ON (x.pid = z.pid AND z.key = 'comment') \n"
            ."	WHERE x.key = 'browse') stat \n"
            ."ON (stat.pid = note.pid) \n"
            ."WHERE note.time < FROM_UNIXTIME(".$time.") and note.ignore = 0 \n"
            ."ORDER BY note.time DESC \n"
            ."LIMIT ".$startIdx.", ".$count;


        $result = $mysql->tryRunSQL($sql);
        $list = array();
        for($i = 0; $i < count($result->data); $i++)
        {
            $data = $result->data[$i];
            $note = new NoteEntity();
            $note->pid = (int)$data["pid"];
            $note->text = $data["text"];
            $note->time = $data["time"];
            $note->author = new PublicUserInfo();
            $note->author->uid = $data["uid"];
            $note->author->name = $data["name"];
            $note->author->avatar = urldecode($data["avatar"]);
            $note->author->url = urldecode($data["url"]);
            $note->postData = new PostDataEntity();
            $note->postData->views = (int)$data["view"];
            $note->postData->likes = (int)$data["like"];
            $note->postData->comments = (int)$data["comments"];
            $list[$i] = $note;
        }
        return $list;
    }
}
?>