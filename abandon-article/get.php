<?php
header("Cache-Control: no-cache, must-revalidate");
require "Article.php";
class Response
{
    public $status;
    public $error;
    public $errorCode=0;
    public $data;
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
$pid=$_GET['pid'];
try
{
    $article = Article::Get($pid);
    $response->data=$article;
    $response->status="^_^";
    $response->send();
}
catch (Exception $ex)
{
    $response->errorCode=$ex->getCode();
    $response->error = $ex->getMessage();
    $response->send();
}

?>