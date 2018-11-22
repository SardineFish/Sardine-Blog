<?php
    class TokenResult
    {
        public $error;
        public $errno;
        public $succeed;
        public $data;
        function __construct()
        {
            $this->errno=0;
            $this->error="";
            $this->succeed=false;
        }
    }
    class Token
    {
        public static function Verify($token,$uid,$mysql=null)
        {
            if(!class_exists("SarMySQL"))
            {
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            }
            $r=new TokenResult();
            try 
            {
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
                $sql="select `token`,`owner`,`deadline` from `token` where `token` = '".$token."' and `available` = 1";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    $r->errno=$result->errno;
                    $r->error=$result->error;
                    return $r;
                }
                //echo $sql;
                //print_r($result->data);
                if(count($result->data)<=0)
                {
                    $r->errno=1010202001;
                    $r->error="Data do not exist.";
                    return $r;
                }
                if($uid!=""&&$uid)
                {
                    $owner=$result->data[0]['owner'];
                    if($owner!=$uid)
                    {
                        $r->errno=1010203002;
                        $r->error="Identity does not match.";
                        return $r;
                    }
                }
                $deadline=(int)$result->data[0]['deadline'];
                if($deadline<time())
                {
                    $r->errno=1010203003;
                    $r->error="Token expired.";
                    return $r;
                }
                $r->succeed=true;
                $r->data=$token;
                return $r;
            }
            catch(Exception $ex)
            {
                $r->errno=1010100001;
                $r->error="Php running error.".$ex->getMessage();
            }
            return $r;
        }
        public static function Save($token,$uid,$url,$deadline,$mysql=null)
        {
            if(!class_exists("SarMySQL"))
            {
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/const.php";
                require $_SERVER['DOCUMENT_ROOT']."/lib/mysql/MySQL.php";
            }
            $r=new TokenResult();
            try 
            {
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
                date_default_timezone_set('PRC'); 
                $time=date("Y-m-d H:i:s");
                $sql = "INSERT INTO `token` (`index`, `token`, `owner`, `url`, `time`, `deadline`, `available`) VALUES (NULL, '".$token."', '".$uid."', '".$url."', '".$time."', '".$deadline."', '1');";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    if($result->errno==1062)
                    {
                        $r->errno=1010202002;
                        $r->error="Token already existed.";
                        return $r;
                    }
                    $r->errno=$result->errno;
                    $r->error=$result->error;
                    return $r;
                }
                $r->succeed=true;
                $r->data=$token;
                return $r;
            }
            catch(Exception $ex)
            {
                $r->errno=1010100001;
                $r->error="Php running error.".$ex->getMessage();
            }
            return $r;
        }
    }
    /*require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    print_r($_GET);
    $token=$_GET['token'];
    $uid=$_GET['uid'];
    $deadline=$_GET['deadline'];
    $result=Token::Save($token,$uid,'/',$deadline);
    if(!$result->succeed)
    {
        echo $result->errno.$result->error;
    }
    else 
        echo "true  ".$result->data;*/
?>