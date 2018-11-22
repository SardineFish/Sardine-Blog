<?php

class UsersResultClass
{
    public $succeed=false;
    public $errno=0;
    public $error="";
    public $user=null;
}

/**
 * Users short summary.
 *
 * Users description.
 *
 * @version 1.0
 * @author Sardi
 */
class Users
{
    public $id;
    public $uid;
    public $name;
    public $face;
    public $email;
    public $url;

    public static function GetUser($uid,$mysql=null)
    {
        define('BASE_PATH',str_replace('\\','/',realpath(dirname(__FILE__).'/'))."/");

        $r=new UsersResultClass();

        if(!preg_match("/^[^`,\"\']+$/",$uid))
            throw new Exception("Invalid user name.",1010201001);

        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        if(!class_exists("Account"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
        }

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
        {
            $result=$mysql->connect();
            if(!$result->succeed)
                throw new Exception($result->error,$result->errno);
        }
        
        $sql = 'SELECT `id`,`uid`,`name`,`icon`,`email`,`url` FROM `user_data` WHERE `uid`=\''.$uid.'\' AND `ignore`=0';
        $result=$mysql->runSQL($sql);
        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);
        if(count($result->data)<=0)
            throw new Exception("User doesn't exist or has been banned.",1010201009);

        $user=new Users ();
        $user->id=$result->data[0]['id'];
        $user->uid=$result->data[0]['uid'];
        $user->name=$result->data[0]['name'];
        $user->face=urldecode($result->data[0]['icon']);
        try
        {
            if(Account::CheckPermissionV2(UserLevels::Admin))
            {
                $user->email = urldecode($result->data[0]['email']);
                $user->url = urldecode($result->data[0]['url']);
            }
            else
                throw new Exception();
        }
        catch(Exception $ex)
        {
            
        }

        return $user;
    }

    public static function Edit($uid,$key,$value,$mysql=null)
    {
        $r=new UsersResultClass ();
        if(!preg_match("/^[^`,\"\']+$/",$uid))
        {
            $r->error="User name error.";
            $r->errno=1010201001;
            return $r;
        }
        if(!preg_match("/^[^`,\"\']+$/",$key))
        {
            $r->error="Invalid argument";
            $r->errno=1010100002;
            return $r;
        }
        $value = urlencode($value);
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");
        
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
        
        // Here is a Very serious BUG, but it doesn't matter since it doesn't provide an public API
        $sql="BEGIN;"
            ."INSERT INTO `user_data` (`id`,`uid`,`name`,`pwd`,`encryption`,`level`,`icon`,`operation`,`time`,`ignore`) SELECT `id`,`uid`,`name`,`pwd`,`encryption`,`level`,`icon`,'edited'as`operation`,'".$time."' as `time`,'2'as`ignore` FROM `user_data` WHERE `uid`='".$uid."' AND `ignore`=0;"
            ."UPDATE `user_data` SET `ignore` = 1 WHERE `uid`='".$uid."' AND `ignore`<>2;"
            ."UPDATE `user_data` SET `ignore` = 0 WHERE `uid`='".$uid."' AND `ignore`=2;"
            ."UPDATE `user_data` SET `".$key."` = '".$value."' WHERE `uid`='".$uid."' AND `ignore` = 0;"
            ."COMMIT;";
        $result = $mysql->runSQLM($sql);
        if(!is_array($result) && $result->succeed == false)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $r->succeed =true;
        return $r;

    }

}
