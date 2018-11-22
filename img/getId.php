<?php
    define("DEBUG",false);
    require "../lib/mysql/const.php";
    require "../lib/mysql/MySQL.php";
    require "../statistics/Statistics.php";
    require "../img/Img.php";
    class Response
    {
        public $status;
        public $msg;
        public $data;
        function __construct()
        {
            $this->status=">_<";
            $this->msg="";
            $this->data=0;
        }
        public function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    $response=new Response();
    $retry=0;
    Retry:
    $result=Img::NewId();
    if(!$result->succeed)
    {
        if($result->errno==1010202002)
        {
            $retry++;
            if($retry>=5)
            {
                $response->msg="Getting id error.";
                if(DEBUG)
                    $response->msg.=$result->error;
                $response->send();
            }
            goto Retry;
        }
        else
        {
            $response->msg="Getting id error.";
            if(DEBUG)
                $response->msg.=$result->error;
            $response->send();
        }
    }
    $id=$result->data;
    $response->data=$id;
    $response->status="^_^";
    $response->send();
?>