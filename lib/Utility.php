<?php
/*
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
        $this->error="";
        $this->errorCode=0;
        $this->data=null;
        $this->msg="";
    }
    public function send()
    {
        header("Content-Type: application/json");
        echo json_encode($this);
        exit();
    }
}*/
class Response
{
    public $status;
    public $data;
    public $msg;
    function __construct()
    {
        $this->status=">_<";
        $this->msg="";
        $this->data=0;
    }
    public function send($data=null)
    {
        if($data!==null)
        {
            $this->data = $data;
            $this->status="^_^";
        }
        header("Content-Type: application/json");
        echo json_encode($this);
        exit();
    }
    public function error(string $error,int $errorCode)
    {
        $this->msg=$error;
        $this->data=$errorCode;
        $this->status=">_<";
        $this->send();
    }
}
?>