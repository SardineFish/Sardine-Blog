<?php
header('Cache-Control:no-cache,must-revalidate');   
header('Pragma:no-cache');   
header("Expires:0"); 

require "Comment.php";
class Response
{
    public $status=">_<";
    public $errorCode=0;
    public $msg="";
    public $data=null;
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
$cid=array_key_exists('cid',$_GET)? $_GET['cid']:null;
$time=array_key_exists('time',$_GET)? $_GET['time']:null;
$from=array_key_exists('from',$_GET)? $_GET['from']:null;
$count=array_key_exists('count',$_GET)? $_GET['count']:null;
try 
{
    $response->data=Comment::GetList($cid,$from,$count,$time);
    $response->status="^_^";
    $response->send();
}
catch (Exception $ex)
{
    $response->errorCode=$ex->getCode();
    $response->msg=$ex->getMessage();
    $response->send();
}
?>