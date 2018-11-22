<?php
session_start();
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "Account.php";
    require $_SERVER['DOCUMENT_ROOT']."/account/token/Token.php";
    class Response
    {
        public $status="";
        public $js="";
        public $msg="";
        public $data=null;
        function __construct($status,$js,$msg)
        {
            $this->status=$status;
            $this->js=$js;
            $this->msg=$msg;
        }
        public function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    function urlsafe_base64_encode($string) 
    {
        $data = base64_encode($string);
        $data = str_replace(array('+','/','='),array('-','_',''),$data);
        return $data;
    }
    $response=new Response(">_<","","");
    $uid=$_POST["uid"];
    $pwd=$_POST["pwd"];
    //print_r($_POST);
    $ref=$_SESSION["ref"];
    if(!$uid||!$pwd)
    {
        $response->msg="Parameter Error.";
        echo json_encode($response);
        exit();
    }
    if(!preg_match("/^[^`,\"\']+$/",$uid))
    {
        $response->msg="User name error.";
        echo json_encode($response);
        exit();
    }
    $result=Account::Login($uid,$pwd);
    if(!$result->succeed)
    {
        $response->msg="Login Failed.".$result->error;
        $response->send();
    }
    $_SESSION['login']=true;
    $_SESSION['id']=$result->account->id;
    $_SESSION['uid']=$result->account->uid;
    $_SESSION['level']=$result->account->level;
    $response->status="^_^";
    Retry:
    $token=sha1(urlsafe_base64_encode(hash_hmac('sha1',urlsafe_base64_encode(microtime()),$uid.$pwd,true)));
    $deadline=time()+86400;
    $tResult=Token::Save($token,$uid,"/",$deadline);
    if(!$tResult->succeed)
    {
        if($tResult->errno==1010202002)
            goto Retry;
        $response->msg="Saving tokken error.";
        if(DEBUG)
            $response->msg.=$tResult->errno.$tResult->error;
    }
    setcookie("token",$token,$deadline,"/");
    setcookie("login","true",$deadline,"/");
    setcookie("uid",$result->account->uid,$deadline,"/");
    if($ref!="")
        $response->js='window.location.href="'.$ref.'";';
    $response->data=array();
    $response->data["token"]=$token;
    $response->send();
?>