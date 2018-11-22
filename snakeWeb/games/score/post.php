<?php
define("DEBUG",false);
    require "../../lib/mysql/const.php";
    require "../../lib/mysql/MySQL.php";
    require "Score.php";
    class Response
    {
        public $status;
        public $msg;
        public $data;
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
    $game=$_POST['game'];
    $uid=$_POST['uid'];
    $score=$_POST['score'];
    //print_r($_POST);
    if(!$game||$game==""||!$uid||$uid==""||!$score||$score=="")
    {
        $response->msg="Parameters error.";
        $response->send();
    }

    $result=Score::Post($game,$uid,$score);
    if(!$result->succeed)
    {
        $response->msg="Score recoding error.";
        if(DEBUG)
            $response->msg.=$result->errno.$result->error;
        $response->send();
    }
    $response->data=$result->data;
    $response->status="^_^";
    $response->send();
?>