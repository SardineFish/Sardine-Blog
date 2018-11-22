<?php
    define("DEBUG",true );
    require "Works.php";
    class Response
    {
        public $status;
        public $errorCode;
        public $error;
        public $data;
        public $msg;
        function __construct()
        {
            $this->status=">_<";
            $this->errorCode=0;
            $this->error=null;
            $this->msg="";
        }
        public function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    $response=new Response();
    $pid=$_GET['pid'];
    try 
    {
        $response->data=Works::Get($pid);
        $response->status="^_^";
        $response->send();
    }
    catch(Exception $ex)
    {
        $response->errorCode=$ex.getCode();
        $response->error=$ex.getMessage();
        $response->send();
    }
?>