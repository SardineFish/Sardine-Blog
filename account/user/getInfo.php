<?php
require("Users.php");
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
$uid = array_key_exists("uid",$_GET)? $_GET['uid']:null;
$response = new Response();
if(!$uid)
{
    $response->error("Paramaters error.",1010100002);
}
try
{
    $response->send(Users::GetUser($uid));
}
catch(Exception $ex)
{
    $response->error($ex->getMessage(),$ex->getCode());
}
?>