<?php
define("DEBUG",false);
/**
 * Score short summary.
 *
 * Score description.
 *
 * @version 1.0
 * @author Sardine
 */
class ScoreResult
{
    public $succeed;
    public $error;
    public $errno;
    public $data;
    function __construct()
    {
        $this->succeed=false;
        $this->error="";
        $this->errno=0;
        $this->data=null;
    }
}
class Score
{
    public static function Get($game, $page=1, $count=10)
    {
        $r=new ScoreResult();
        try
        {
            $mysql=new SarMySQL(HOST,SAR_UID,SAR_PWD,SAR_DB,PORT);
            $result=$mysql->connect();
            if(!$result->succeed)
            {
                $r->error="MySQL connecting error.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            $sql = "SELECT `uid`,`score`,`time` FROM `score` WHERE `ignore` = 0 ORDER BY `score` DESC LIMIT ".(($page-1)*$count).",".($page*$count);
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            $r->data=$result->data;
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            $r->errno=11251000;
            $r->error="PHP running error.".$ex->getMessage();
            return $r;
        }
        return $r;
    }

    public static function Post($game, $uid, $score)
    {
        $r=new ScoreResult();
        try
        {
            if(!preg_match("/^[^`,\"\']+$/",$game))
            {
                $r->error="Game does not exist";
                $r->errno=11252001;
                return $r;
            }
            if(!preg_match("/^[^`,\"\']+$/",$uid))
            {
                $r->error="User name error.";
                $r->errno=1125100101;
                return $r;
            }
            if(strlen($game)>128)
            {
                $r->error="The name of the game is too long.";
                $r->errno=11253001;
                return $r;
            }
            if(strlen($uid)>32)
            {
                $r->error="The Username is too long.";
                $r->errno=11253001;
                return $r;
            }
            if($score<0)
            {
                $r->error="Score error.";
                $r->errno=11252101;
                return $r;
            }
            $time=date("Y-m-d H:i:s");
            $mysql=new SarMySQL(HOST,SAR_UID,SAR_PWD,SAR_DB,PORT);
            $result=$mysql->connect();
            if(!$result->succeed)
            {
                $r->error="MySQL connecting error.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            $sql = "SELECT `uid`,`score` FROM `score` WHERE `uid`='".$uid."' and `score`=".$score;
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error1.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            if(count($result->data)>0)
            {
                goto GetRank;
            }
            $sql = "INSERT INTO `app_sardinedb`.`score` (`index`, `game`, `uid`, `score`, `data`, `time`, `ignore`) VALUES (NULL, '".$game."', '".$uid."', '".$score."', '', '".$time."', '0');";
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error2.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            GetRank:
            $sql = "select count(*) as `rank` from `score` where score > ".$score;
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error2.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
            if(count($result->data)<=0)
            {
                $r->error="Data is null";
                $r->errno=11253101;
                return $r;
            }
            $r->data=$result->data[0]['rank']+1;
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            $r->errno=11251000;
            $r->error="PHP running error.".$ex->getMessage();
            return $r;
        }
        return $r;
    }
}
