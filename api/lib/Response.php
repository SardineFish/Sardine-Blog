<?php
class Response
{
    public $status;
    public $errorCode;
    public $error;
    public $msg;
    public $processTime;
    public $data;
    function __construct()
    {
        $this->status=">_<";
        $this->msg="";
        $this->data=0;
        $this->processTime = round(microtime(true) * 1000);
    }
    public function send($data=null)
    {
        if($data!==null)
        {
            $this->data = $data;
            $this->status="^_^";
        }
        header('Cache-Control: no-cache,must-revalidate');   
        header("Content-Type: application/json");

        echo json_encode($this);
        exit();
    }
    public function error(string $error,int $errorCode)
    {
        $this->error = $error;
        $this->msg = $error;
        $this->errorCode = $errorCode;
        $this->status = ">_<";
        $this->send();
    }
}
?>