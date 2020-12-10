<?php
error_reporting(E_ERROR);
require_once $_SERVER['DOCUMENT_ROOT']."/api/misc/DBHelper.php";
class PublicUserInfo
{
    public $uid;
    public $name;
    public $avatar;
    public $url;
    public $level;
}
class UserInfo
{
    public $id;
    public $uid;
    public $name;
    public $avatar;
    public $url;
    public $email;
    public $level;
    public $pwd;
    public $encryption;
    public static function Create(string $name, string $email, string $url) : UserInfo
    {
        $user = new UserInfo();
        $user->name = $name;
        $user->email = $email;
        $user->url = $url;
        return $user;
    }
}
class AccountV3
{
    public static function SimpleAuth(UserInfo $user, SarMySQL $mysql = null) : UserInfo
    {
        try 
        {
            $user = AccountV3::Auth($user, $mysql);
        }
        catch(Exception $ex)
        {
            if($ex->getCode() == 1010201008 || $ex->getCode() == 1010201006)
            {
                $user = AccountV3::QuickRegister($user, $mysql);
            }
            else
                throw $ex;
        }

        
        if(session_status() != PHP_SESSION_ACTIVE)
            session_start();
        $_SESSION["login"] = true;
        $_SESSION["uid"] = $user->uid;

        return $user;
    }
    public static function Auth(UserInfo $user, SarMySQL $mysql = null) : UserInfo
    {
        if(session_status() != PHP_SESSION_ACTIVE)
            session_start();
        if($_SESSION["login"] && $_SESSION["uid"])
        {
            $uid = $_SESSION["uid"];

            if(!$mysql)
                $mysql = DBHelper::Connect();

            $sql = "SELECT * FROM user_data WHERE `uid` = '".$mysql->escape($uid)."' AND `ignore` = 0";
            $data = $mysql->tryRunSQL($sql)->data;
            if(count(data) <= 0)
                throw new Exception("User not exists.", 1010201006);
            else if(data[0]["name"] != $user->name)
                throw new Exception("User not login.", 1010201008);

            $user->avatar = $data[0]["icon"];
            $user->email = $data[0]["email"];
            $user->level = $data[0]["level"];
            return $user;
        }
        throw new Exception("User not login.", 1010201008);
    }
    public static function QuickRegister(UserInfo $user, SarMySQL $mysql = null) : UserInfo
    {
        $uid = sha1($user->name."'".$user->email);
        $pwd = $uid;
        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");

        $size = 256;
        $default = "https://cdn-static.sardinefish.com/img/decoration/unknown-user.png";
        $user->avatar = "https://www.gravatar.com/avatar/" . md5( strtolower( trim( $user->email ) ) ) . "?d=" . urlencode( $default ) . "&s=" . $size;
        
        AccountV3::ValidateUserInfo($user);

        
        if(!$mysql)
            $mysql = DBHelper::Connect();

        try
        {
            $mysql->beginTranscation();
            
            $sql = 
               ' SET @UID = \''.$uid.'\';'
             . ' SET @NAME = \''.$mysql->escape($user->name).'\';'
             . ' SET @PWD = \''.$pwd.'\';'
             . ' SET @ENCRYPTION =\'none\';'
             . ' SET @LEVEL = \''.UserLevels::Visitor.'\';'
             . ' SET @TIME = \''.$time.'\';'
             . ' SET @EMAIL = \''.$mysql->escape($user->email).'\';'
             . ' SET @AVATAR = \''.$mysql->escape($user->avatar).'\';'
             . ' SET @URL = \''.$mysql->escape($user->url).'\';'
             . ' INSERT INTO `account` (`uid`,`time`,`ignore`) VALUES(@UID,@TIME,0);'
             . ' SET @ID = @@IDENTITY ;'
             . ' INSERT INTO `user_data` (`id`,`uid`,`name`,`level`,`pwd`,`encryption`,`email`,`icon`,`url`,`operation`,`time`,`ignore`) '
             . ' VALUES(@ID,@UID,@NAME,@LEVEL,@PWD,@ENCRYPTION,@EMAIL,@AVATAR,@URL,\'created\',@TIME,0);';
            
            $results = $mysql->tryRunSQLM($sql);

            $mysql->commit();

            $user->uid = $uid;
            $user->level = UserLevels::Visitor;

            return $user;
        }
        catch(Exception $ex)
        { // User Exists.
            $mysql->rollback();

            $sql = "SELECT * FROM user_data WHERE `uid` = '".$mysql->escape($uid)."' AND `ignore` = 0";
            $data = $mysql->tryRunSQL($sql)->data;
            if(count($data) <= 0)
                throw new Exception("Access denied.", 1010201003);
            if(UserLevels::CheckHigher($data[0]["level"], UserLevels::Def))
            {
                throw new Exception("Please login.", 1010201008);
            }
            
            $user->uid = $uid;
            $user->url = $data[0]["url"];
            $user->level = $data[0]["level"];

            return $user;
        }
    }
    public static function ValidateUserInfo(UserInfo $user)
    {
        if($user->email && !preg_match("/^\\S+@\\S+\\.\\S+$/",$user->email))
            throw new Exception("Invalid email address.",1010100002);
    }
    public static function GetUserInfo(string $uid, SarMySQL $mysql = null) : UserInfo
    {
        try
        {
            if(!$mysql)
                $mysql = DBHelper::Connect();
            
            $sql  = 'SELECT * FROM `user_data` WHERE uid = \''.$uid.'\' AND `ignore` = 0';

            $result = $mysql->tryRunSQL($sql);
            $data = $mysql->tryRunSQL($sql)->data;
            if(count($data) <= 0)
                throw new Exception("User not exists.", 1010201006);

            $user = new UserInfo();
            $user->uid = $data[0]["uid"];
            $user->name = $data[0]["name"];
            $user->avatar = $data[0]["icon"];
            $user->email = $data[0]["email"];
            $user->level = $data[0]["level"];
            $user->pwd = $data[0]['pwd'];
            $user->encryption = $data[0]['encryption'];
            $user->id = $data[0]['id'];
            $user->url = $data[0]['url'];
            
            return $user;
        }
        catch (Exception $ex)
        {
            throw new Exception("Internal db error", 1010100003);
        }
    }
    public static function SetUserInfo(UserInfo $user, SarMySQL $mysql = null) : UserInfo 
    {
        if(!$mysql)
            $mysql = DBHelper::Connect();

        
        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");

        $mysql->beginTranscation();
            
        $sql = 
           ' SET @UID = \''.$mysql->escape($user->uid).'\';'
         . ' SET @NAME = \''.$mysql->escape($user->name).'\';'
         . ' SET @PWD = \''.$user->pwd.'\';'
         . ' SET @ENCRYPTION =\''.$user->encryption.'\';'
         . ' SET @LEVEL = \''.$user->level.'\';'
         . ' SET @TIME = \''.$time.'\';'
         . ' SET @EMAIL = \''.$mysql->escape($user->email).'\';'
         . ' SET @AVATAR = \''.$mysql->escape($user->avatar).'\';'
         . ' SET @URL = \''.$mysql->escape($user->url).'\';'
         . ' SET @ID = \''.$user->id.'\' ;'
         . ' UPDATE `user_data` SET `ignore` = 1 WHERE `uid` = @UID;'
         . ' INSERT INTO `user_data` (`id`,`uid`,`name`,`level`,`pwd`,`encryption`,`email`,`icon`,`url`,`operation`,`time`,`ignore`) '
         . ' VALUES(@ID,@UID,@NAME,@LEVEL,@PWD,@ENCRYPTION,@EMAIL,@AVATAR,@URL,\'edited\',@TIME,0);';
            
        $results = $mysql->tryRunSQLM($sql);

        $mysql->commit();

        return $user;
    }
}
class UserLevels
{
    const Developer="developer";
    const Admin="admin";
    const Def="default";
    const Guest="guest";
    const Visitor="visitor";
    const Test="test";
    public static function LevelInt($level)
    {
        switch($level)
        {
            case UserLevels::Developer:
                return 1;
            case UserLevels::Admin:
                return 2;
            case UserLevels::Def:
                return 3;
            case UserLevels::Guest:
                return 4;
            case UserLevels::Visitor:
                return 5;
            case UserLevels::Test:
                return 0;
            default:
                return -1;
        }
    }
    public static function CheckHigher(string $levelToCheck,string $referLevel):bool
    {
        return UserLevels::LevelInt($levelToCheck) <= UserLevels::LevelInt($referLevel);
    }
    public static function CheckLower(string $levelToCheck,string $referLevel):bool
    {
        return UserLevels::LevelInt($levelToCheck) >= UserLevels::LevelInt($referLevel);
    }
}
?>