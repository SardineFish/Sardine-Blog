<?php
require "PostData.php";
header("Cache-Control:no-cache");
class Response
{
    public $status;
    public $msg;
    public $errorCode;
    public $data;
    public function __construct()
    {
        $this->status =">_<";
        $this ->msg ="";
        $this ->errorCode =0;
        $this ->data =0;
    }
    public function send()
    {
        echo json_encode ($this );
        exit ();
    }

}
$response=new Response ();
$pid = $_GET['pid'];
$result = PostDataComment::Get ($pid );
if(!$result->succeed )
{
    if($result->errno==1010202001)
    {
        $response->data =0;
        $response->status ="^_^";
        $response->send ();
    }
    $response->errorCode = $result->errno;
    $response ->msg =$result->error;
    $response->send ();
}
$response->data =$result->data ;
$response->status ="^_^";
$response->send ();
?>