<?php
define("DEBUG",true);
session_start();
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "../all/edit.php";
    require "../account/Account.php";
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
    $response=new Response();
    $id=$_POST['id'];
    $name=$_POST['name'];
    $tags=$_POST['tags'];
    $detail=$_POST['detail'];
    $description=$_POST['description'];
    $summary=$_POST['summary'];
    $urlDownload=$_POST['urlDownload'];
    $type=$_POST['type'];
    $imgId=$_POST['imgId'];
    $version=$_POST['version'];
    date_default_timezone_set('PRC'); 
    $time=date("Y-m-d H:i:s");
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
    if(preg_match('/\S+/',$name)=="")
    {
        $response->msg="Title cannot be empty.";
        $response->send();
    }
    if(id==false)
    {
        $response->msg="All add error.";
        $response->send();
    }
    $mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
    //MySQL connect
    $result=$mysql->connect();
    if(!$result->succeed)
    {
        $response->msg="MySQL connecting error.";
        $response->send();
    }
    $sql='select `index` from `works` where `id`=\''.$id.'\' and `ignore` = 0';
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL runing error 1.";
        if($DEBUG)
            echo $result->error.
        $response->send();
    }
    if(count($result->data)<=0)
    {
        $response->msg="The id ".$id." note does not exist.";
        $response->send();
    }
    $sql="select `version` from `works` where `id` = '".$id."'";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error2.";
        if(DEBUG)
            $response->msg.="\$sql=  ".$sql."   ".$result->errno.$result->error;
        $response->send();
    }
    for($i=0;$i<count($result->data);$i++)
    {
        if($version==$result->data[$i]['version'])
        {
            $response->msg="Version already existed.";
            $response->send();
        }
    }
    $sql="update `works` set `ignore` = 1 where `id`=".$id." and `ignore` = 0";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error3.";
        $response->send();
    }
    //insert new recode
    $sql = "insert into `works` (`index`, `id`, `name`, `version`, `author`, `tags`, `imgId`, `detail`, `description`, `summary`, `urlDownload`, `time`, `type`, `operate`, `ignore`) values (NULL, '".$id."', '".$name."', '".$version."', '".$uid."', '".$tags."', '".$imgId."', '".$detail."', '".$description."', '".$summary."', '".$urlDownload."', '".$time."', '".$type."', 'updated', '0');";
    $result=$mysql->runSQL($sql);
    if(!$result->succeed)
    {
        $response->msg="MySQL running error4.";
        $response->send();
    }
    //edit all
    if(All_Edit($id,'works',$name,$tags,$description,$uid,$time)==false)
    {
        $response->msg="MySQL runing error 5.";
        if($DEBUG)
            echo $result->error.
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>