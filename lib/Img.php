<?php
    class ImgResult
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
        }
    }
    class Img
    {
        public static function NewId()
        {
            $r=new ImgResult();
            try 
            {
                if(!class_exists("Statistics"))
                {
                    require "../statistics/Statistics.php";
                }
                if(!class_exists("SarMySQL"))
                {
                    require "../lib/mysql/MySQL.php";
                }

                $sResult=Statistics::Set("imgId",'+',1);
                if(!$sResult->succeed)
                {
                    $r->error=$sResult->error;
                    $r->errno=$sResult->errno;
                    return $r;
                }
                $id=$sResult->value;
                $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
                $result=$mysql->connect();
                $time=date("Y-m-d H:i:s");
                if(!$result->succeed)
                {
                    $r->error=$result->error;
                    $r->errno=$result->errno;
                    return $r;
                }
                $sql = "INSERT INTO `img` (`index`, `id`, `operator`, `time`) VALUES (NULL, '".$id."', '', '".$time."');";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    if($result->errno==1062)
                    {
                        $r->errno=1010202002;
                        $r->error="Id already existed.";
                        return $r;
                    }
                    $r->errno=$result->errno;
                    $r->error=$result->error;
                    return $r;
                }
                $r->data=$id;
                $r->succeed=true;
                return $r;
            }
            catch (Exception $ex)
            {
                $r->errno=1010100001;
                $r->error="Php running error.".$ex->getMessage();
            }
            return $r;
        }
    }
?>