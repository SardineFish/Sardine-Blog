<?php
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
}
?>