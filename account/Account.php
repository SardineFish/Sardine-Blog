<?php
/**
 * Result short summary.
 *
 * Result description. 
 *
 * @version 1.0
 * @author Sardine
 * @var bool $succeed ��ȡһ��ֵָʾ�Ƿ���ɲ����Ҳ����ִ������
 * @var string $error ��ȡһ��ֵ��ʾ������Ϣ
 * @var int $errno ��ȡһ��ֵ��ʾ������루�Զ���������� Custom Error Code.xml��
 * @var Account $account ��ȡһ���˻�����
 */
class AccountResult
{
    public $succeed;
    public $error;
    public $errno;
    public $account;
    function __construct()
    {
        $this->succeed=false;
        $this->error="";
        $this->errno=0;
    }
}
class Account
{
    public $id;
    public $uid;
    public $level;
    public $banned;
    public $encryption;
    function __construct($id,$uid,$level,$enryption,$banned=false)
    {
        $this->id=$id;
        $this->uid=$uid;
        $this->level=$level;
        $this->encryption=$enryption;
        $this->banned=$banned;
    }
    public static function Login($uid,$pwd,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        $r=new AccountResult();
        if(!$uid||!$pwd)
        {
            $r->error="Parameter Error.";
            $r->errno=1010100002;
            return $r;
        }
        if(!preg_match("/^[^`,\"\']+$/",$uid))
        {
            $r->error="User name error.";
            $r->errno=1010201001;
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
        $sql = "select `id`,`uid`,`pwd`,`encryption`,`level`,`operation` from `user_data` where `uid` = '".$uid."' and `ignore` = 0";
        $result = $mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        $data=$result->data[0];
        $pwdGet=$data["pwd"];
        $encryption=$data['encryption'];
        $operation=$data['operation'];
        $idGet=$data['id'];
        $levelGet=$data['level'];

        if($operation=='banned')
        {
            $r->error="The user has been banned.";
            $r->errno=1010201003;
            return $r;
        }
        if(sha1($pwd)==$pwdGet)
        {
            $r->succeed=true;
            $r->account=new Account($idGet,$uid,$levelGet,$encryption);
            return $r;
        }
        $r->error="Password wrong.";
        $r->errno=1010201005;
        return $r;
    }
    public static function Register($uid,$pwd,$level,$encryption,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }

        date_default_timezone_set('PRC'); 
        $time=date("Y-m-d H:i:s");
        $r=new AccountResult();
        if(!$uid||!$pwd)
        {
            $r->error="Parameter Error.";
            $r->errno=1010100002;
            return $r;
        }
        if(!preg_match("/^[^`,\"\']+$/",$uid))
        {
            $r->error="User name error.";
            $r->errno=1010201001;
            return $r;
        }
        if(!preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$level) || !preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$encryption))
        {
            $r->error="Parameter Error.";
            $r->errno=1010100002;
            return $r;
        }

        $checkResult = Account::CheckUid($uid);
        if(!$checkResult->succeed)
        {
            $r->error=$checkResult->error;
            $r->errno=$checkResult ->errno;
            return $r;
        }

        $pwd=sha1($pwd);

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
        $sql = 'BEGIN;'
         . ' SET @UID = \''.$uid.'\';'
         . ' SET @NAME = @UID;'
         . ' SET @PWD = \''.$pwd.'\';'
         . ' SET @ENCRYPTION =\''.$encryption.'\';'
         . ' SET @LEVEL = \''.$level.'\';'
         . ' SET @TIME = \''.$time.'\';'
         . ' INSERT INTO `account` (`uid`,`time`,`ignore`) VALUES(@UID,@TIME,0);'
         . ' SET @ID = @@IDENTITY ;'
         . ' INSERT INTO `user_data` (`id`,`uid`,`name`,`level`,`pwd`,`encryption`,`operation`,`time`,`ignore`) '
         . ' VALUES(@ID,@UID,@NAME,@LEVEL,@PWD,@ENCRYPTION,\'created\',@TIME,0);'
         . ' COMMIT;';
        $result = $mysql->runSQLM($sql);
        if(!$result[7]->affectedRows || !$result[9]->affectedRows)
        {
            $r->error="User already existed.";
            $r->errno=1010201004;
            return $r;
        }
        $id=$result[7]->id;
        $r->succeed=true;
        $r->account=new Account($id,$uid,$level,$encryption);
        return $r;
    }
    public static function RegisterV2(string $uid,string $name,string $email,string $url,string $pwd,string $encryption,string $level,SarMySQL $mysql=null):Account
    {
        if  (  !$uid
            || !$pwd 
            || !preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$level) 
            || !preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$encryption)
            )
            throw new Exception("Parameter Error.",1010100002);
        if($email && !preg_match("/^\\S+@\\S+\\.\\S+$/",$email))
            throw new Exception("Invalid email address.",1010100002);

        require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php");
        require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php");

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();

        if(Account::CheckUidV2($uid,$mysql))
        {
            $pwd=sha1($pwd);
            date_default_timezone_set('PRC'); 
            $time=date("Y-m-d H:i:s");

            // Use Gravatar
            $size = 256;
            $default = "https://cdn-global-static.sardinefish.com/img/decoration/unknown-user.png";
            $avatar = "https://www.gravatar.com/avatar/" . md5( strtolower( trim( $email ) ) ) . "?d=" . urlencode( $default ) . "&s=" . $size;

            $sql = 'BEGIN;'
             . ' SET @UID = \''.$uid.'\';'
             . ' SET @NAME = \''.$name.'\';'
             . ' SET @PWD = \''.$pwd.'\';'
             . ' SET @ENCRYPTION =\''.$encryption.'\';'
             . ' SET @LEVEL = \''.$level.'\';'
             . ' SET @TIME = \''.$time.'\';'
             . ' SET @EMAIL = \''.$email.'\';'
             . ' SET @AVATAR = \''.$avatar.'\';'
             . ' SET @URL = \''.$url.'\';'
             . ' INSERT INTO `account` (`uid`,`time`,`ignore`) VALUES(@UID,@TIME,0);'
             . ' SET @ID = @@IDENTITY ;'
             . ' INSERT INTO `user_data` (`id`,`uid`,`name`,`level`,`pwd`,`encryption`,`email`,`icon`,`url`,`operation`,`time`,`ignore`) '
             . ' VALUES(@ID,@UID,@NAME,@LEVEL,@PWD,@ENCRYPTION,@EMAIL,@AVATAR,@URL,\'created\',@TIME,0);'
             . ' COMMIT;';

            $result = $mysql->runSQLM($sql);
            if(!$result[9]->affectedRows || !$result[11]->affectedRows)
                throw new Exception("User already existed.",1010201004);
            $id=$result[8]->id;

            return new Account($id,$uid,$level,$encryption,false);
        }
    }
    public static function QuickRegister(string $name,string $email, string $url,SarMySQL $mysql=null)
    {
        $uid = sha1($name."'".$email);
        $pwd = $uid;
        try
        {
            require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php");
            require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php");
            if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            $mysql->tryConnect();

            return Account::RegisterV2($uid,$name,$email,$url,$pwd,"none",UserLevels::Visitor,$mysql);
        }
        catch(Exception $ex)
        {
            if($ex->getCode()==1010201004)
            {
                $account = Account::Get($uid,$mysql);
                if($account->level == UserLevels::Visitor)
                    return $account;
                throw new Exception("Please login.",1010201008);
            }
            else
                throw $ex;
        }
    }

    public static function CheckUid($uid,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        $r=new AccountResult();

        if(!$uid || $uid=="" || !preg_match("/^[^`,\"\']+$/",$uid))
        {
            $r->error="User name error.";
            $r->errno=1010201001;
            return $r;
        }

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
        {
            $result=$mysql->connect();
            if(!$result->succeed)
            {
                $r->error="MySQL connecting error.".$result->error;
                $r->errno=$result->errno;
                return $r;
            }
        }
        $sql = "SELECT `uid` FROM `account` where `uid` = '".$uid."'";
        $result = $mysql->runSQL($sql);
        if(!$result->succeed)
        {
            $r->error=$result->error;
            $r->errno=$result->errno;
            return $r;
        }
        if(count($result->data)>0)
        {
            $r->error="User already exist.";
            $r->errno=1010201004;
            return $r;
        }
        $r->succeed=true;
        return $r;
    }
    public static function CheckUidV2(string $uid,SarMySQL $mysql=null):bool
    {
        if(!$uid || !preg_match("/^[^~!@#$%&*()+\-={}\[\]\\\|<>;:?\/\^`,\.\"\']+$/",$uid))
            throw new Exception("Invalid uid.",1010201001);

        require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php");
        require_once($_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php");

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();

        $sql = "SELECT `uid` FROM `account` where `uid` = '".$uid."'";
        $result = $mysql->runSQL($sql);

        if(!$result->succeed)
            throw new Exception($result->error,$result->errno);
        
        if(count($result->data)>0)
            throw new Exception("User already exist.",1010201004);
        return true;
    }
    public static function LevelInt($level)
    {
        switch($level)
        {
            case 'developer':
                return 1;
            case 'admin':
                return 2;
            case 'default':
                return 3;
            case 'guest':
                return 4;
            case 'visitor':
                return 5;
            case 'test':
                return 0;
            default:
                return -1;
        }
    }
    public static function Get($uid,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        }
        if(!preg_match("/^[^`,\"\']+$/",$uid))
            throw new Exception("Username error.",1010201001);

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        if(!$mysql->connected)
        {
            $result=$mysql->connect();

            if(!$result->succeed)
                throw new Exception($resultr->error,$resultr->errno);
        }

        $sql="SELECT `id`,`uid`,`encryption`,`operation`,`level` FROM `user_data` WHERE `uid` = '".$uid."' and `ignore` = 0";
        $result=$mysql->runSQL($sql);

        if(!$result->succeed)
            throw new Exception("MySQL running error.",$resultr->errno);
        
        if(count($result->data)<=0)
            throw new Exception("User does not exist",1010201006);
            
        $data=$result->data[0];
        $id=$data['id'];
        $level=$data['level'];
        $encryption=$data['encryption'];
        $banned=false;
        if($data['operation']=='banned')
            $banned=true;
        return new Account($id,$uid,$level,$encryption,$banned);
    }
    public static function CheckPermission($uid,$level='default',$ignoreBan=false,$mysql=null)
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        $r=new AccountResult();
        try
        {
            if(!preg_match("/^[^`,\"\']+$/",$uid))
            {
                $r->error="User name error.";
                $r->errno=1010201001;
                return $r;
            }
            if(!$mysql)
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
            if(!$mysql->connected)
            {
                $result=$mysql->connect();
                if(!$result->succeed)
                {
                    $r->error="MySQL connecting error.".$result->error;
                    $r->errno=$result->errno;
                    return $r;
                }
            }
            $sql="select `level`,`operation` from `user_data` where `uid` = '".$uid."' and `ignore` = 0";
            $result=$mysql->runSQL($sql);
            if(!$result->succeed)
            {
                $r->error="MySQL running error.";
                $r->errno=$result->errno;
                return $r;
            }
            if(count($result->data)<=0)
            {
                $r->error="User does not exist.";
                $r->errno=1010201006;
                return $r;
            }
            $data=$result->data[0];
            $levelGet=$data['level'];
            $operationGet=$data['operation'];
            $levelGetInt=Account::LevelInt($levelGet);
            if($levelGetInt<0)
            {
                $r->error="User level error.";
                $r->errno=1010201002;
                return $r;
            }
            if(!$ignoreBan&&$operationGet=='banned')
            {
                $r->error="Your account has been banned.";
                $r->errno=1010201003;
            }
            if(is_int($level))
            {
                if($levelGetInt>=$level)
                {
                    echo"get=".$levelGetInt."level=".$level;
                    $r->error="You do not have permission.";
                    $r->errno=1010201007;
                    return $r;
                }
            }
            else
            {
                $levelInt=Account::LevelInt($level);
                if($levelGetInt>$levelInt)
                {
                    $r->error="You do not have permission.";
                    $r->errno=1010201007;
                    return $r;
                }
            }
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            $r->error=$ex->getMessage();
            $r->errno=1010100001;
            return $r;
        }
        
    }
    public static function CheckPermissionV2(string $level='default',SarMySQL $mysql=null): bool
    {
        if(!class_exists("SarMySQL"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
            require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        }
        if(UserLevels::LevelInt($level)<0)
            throw new Exception("Invalid level.",1010100002);

        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();

        $account = Account::CheckLoginV2(null,$mysql);
        return UserLevels::CheckHigher($account->level,$level);
    }
    public static function CheckLogin($mysql=null)
    {
        if(!class_exists("Token"))
            require $_SERVER['DOCUMENT_ROOT']."/account/token/Token.php";
        $r=new AccountResult();
        try 
        {
            $uid=$_COOKIE['uid'];
            $token=$_COOKIE['token'];
            $login=$_COOKIE['login'];
            if(!preg_match("/^[^`,\"\']+$/",$uid))
            {
                $r->errno=1010201001;
                $r->error="Username error.";
                return $r;
            }
            if(!$login||$login!="true")
            {
                $r->errno=1010201008;
                $r->error="User did not logined.";
                return $r;
            }
            if(!$token||$token=="")
            {
                $r->errno=1010203001;
                $r->error="Token invalid.";
                return $r;
            }
            $result=Token::Verify($token,$uid,$mysql);
            if(!$result->succeed)
            {
                $r->errno=$result->errno;
                $r->error=$result->error;
                return $r;
            }
            $r->account=new Account(null,$uid,null,null,false);
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            $r->error=$ex->getMessage();
            $r->errno=1010100001;
            return $r;
        }
    }
    public static function CheckLoginV2(string $uid=null, SarMySQL $mysql=null):Account
    { 
        if(!class_exists("Token"))
            require $_SERVER['DOCUMENT_ROOT']."/account/token/Token.php";

        $uidCookie=$_COOKIE['uid'];
        $token=$_COOKIE['token'];
        $login=$_COOKIE['login'];

        if($uid===null)
            $uid=$uidCookie;

        if($uid===null)
            throw new Exception("No login info.",1010201010);

        // Check paramaters
        if(!preg_match("/^[^`,\"\']+$/",$uid))
            throw new Exception("Username error.",1010201001);
       /* if(!$login||$login!="true")
            throw new Exception("User did not logined.",1010201008);
        if(!$token||$token=="")
            throw new Exception("Invalid token.",1010203001);*/

        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
        require_once $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
        if(!$mysql)
            $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
        $mysql->tryConnect();

        // Need login
        $account = Account::Get($uid,$mysql);
        if(UserLevels::CheckLower($account->level,UserLevels::Visitor))
            return $account;

        // Verify the token
        $result=Token::Verify($token,$uid,$mysql);
        if(!$result->succeed)
        {
            if($result->errno==1010203002)
                throw new Exception("Please login.",1010201008);
            throw new Exception($result->error,$result->errno);
        }
        
        return $account;
    }
    public static function CheckLoginByToken($uid,$token,$mysql=null)
    {
        if(!class_exists("Token"))
            require $_SERVER['DOCUMENT_ROOT']."/account/token/Token.php";
        $r=new AccountResult();
        try 
        {
            if(!preg_match("/^[^`,\"\']+$/",$uid))
            {
                $r->errno=1010201001;
                $r->error="Username error.";
                return $r;
            }
            if(!$token||$token=="")
            {
                $r->errno=1010203001;
                $r->error="Token invalid.";
                return $r;
            }
            $result=Token::Verify($token,$uid,$mysql);
            if(!$result->succeed)
            {
                $r->errno=$result->errno;
                $r->error=$result->error;
                return $r;
            }
            $r->succeed=true;
            return $r;
        }
        catch(Exception $ex)
        {
            $r->error=$ex->getMessage();
            $r->errno=1010100001;
            return $r;
        }
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
