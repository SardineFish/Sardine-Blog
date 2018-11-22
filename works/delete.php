<?php
session_start();
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "../account/Account.php";
    require "../all/delete.php";
    require "../token/Token.php";
    class Response
    {
        public $status;
        public $msg;
        function __construct()
        {
            $this->status=">_<";
            $this->msg="";
        }
        public function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    $id=$_POST['id'];
    date_default_timezone_set('PRC'); 
    $time=date("Y-m-d H:i:s");
    $response=new Response();
    //------------------------------Check For Login------------------------------
    $uid=$_COOKIE['uid'];
    if(!preg_match("/^[^`,\"\']+$/",$uid))
    {
        $response->msg="Please login.";
        $response->send();
    }
    $cResult=Account::CheckLogin($uid);
    if(!$cResult->succeed)
    {
        $response->msg="Please login.";
        if(DEBUG)
            $response->msg.=$cResult->errno.$cResult->error;
        $response->send();
    }
    //------------------------------------------------------------------------------------------
    if(!$id||$id<=0)
    {
        $response->msg="The id cannot be empty or 0";
        $response->send();
    }
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->msg="MySQL connecting error.";
        $response->send();
    }
    $sql="update `works` set `ignore` = 1 where `id` = ".$id." and `ignore` = 0";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error1.";
        $response->send();
    }
    $sql = "insert into `works` (`index`, `id`,`author`, `time`, `operate`, `ignore`) VALUES (NULL, '".$id."', '".$uid."', '".$time."', 'deleted', '1');";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error2.";
        $response->send();
    }
    if(!All_Delete($id,'works',$uid,$time))
    {
        $response->msg="All deleting error.";
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>