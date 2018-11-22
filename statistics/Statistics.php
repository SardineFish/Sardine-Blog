<?php
    class StatisticsResult
    {
        public $succeed;
        public $value;
        public $error;
        public $errno;
        function __construct()
        {
            $this->succeed=false;
            $this->error="";
            $this->errno=0;
            $this->value=0;
        }
    }
    class Statistics
    {
        public static function Get($key,$mysql=null)
        {
            $r=new StatisticsResult();
            try 
            {
                if(!class_exists("SarMySQL"))
                {
                    require "../lib/mysql/const.php";
                    require "../lib/mysql/MySQL.php";
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
                $sql="select `value` from `statistics` where `key` = '".$key."'";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    $r->error=$result->error;
                    $r->errno=$result->errno;
                    return $r;
                }
                if(count($result->data)<1)
                {
                    $r->error="The data donot exist.";
                    $r->errno=1010202001;
                    return $r;
                }
                $r->value=(int)$result->data[0]['value'];
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
        public static function Set($key,$methor,$value,$add=false,$mysql=null)
        {
            $r=new StatisticsResult();
            try 
            {
                if(!class_exists("SarMySQL"))
                {
                    require "../lib/mysql/const.php";
                    require "../lib/mysql/MySQL.php";
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
                $sql="select `value` from `statistics` where `key` = '".$key."'";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    $r->error=$result->error;
                    $r->errno=$result->errno;
                    return $r;
                }
                if(count($result->data)<1)
                {
                    if($add)
                    {
                        $addResult=Statistics::Add($key,$value,$mysql);
                        if(!$addResult->succeed)
                        {
                            $r->error=$addResult->error;
                            $r->errno=$addResult->errno;
                            return $r;
                        }
                        $r->succeed=true;
                        $r->value=$addResult->value;
                        return $r;
                    }
                    else
                    {
                        $r->error="The data donot exist.";
                        $r->errno=1010202001;
                        return $r;
                    }
                }
                $v=$result->data[0]['value'];
                if($methor=="+")
                    $v+=$value;
                else if ($methor=="-")
                    $v-=$value;
                else
                {
                    $r->error="Paramter error.";
                    $r->errno=1010100002;
                    return $r;
                }
                $sql="update `statistics` set `value` = ".$v." where `key` = '".$key."'";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    $r->error=$result->error;
                    $r->errno=$result->errno;
                    return $r;
                }
                $r->value=$v;
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
        public static function Add($key,$value=0,$mysql=null)
        {
            $r=new StatisticsResult();
            try
            {
                if(!class_exists("SarMySQL"))
                {
                    require "../lib/mysql/const.php";
                    require "../lib/mysql/MySQL.php";
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
                $sql = "INSERT INTO `statistics` (`index`, `key`, `value`) VALUES (NULL, '".$key."', '".$value."');";
                $result=$mysql->runSQL($sql);
                if(!$result->succeed)
                {
                    if($result->errno==1062)
                    {   
                        $r->error="Data already exist.";
                        $r->errno=1010202002;
                    }
                    else
                    {
                        $r->error=$result->error;
                        $r->errno=$result->errno;
                    }
                    return $r;
                }
                $r->value=$value;
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
?>