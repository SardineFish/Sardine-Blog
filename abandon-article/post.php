<?php
    define("FUNCTION_ONLY",true);
    define("DEBUG",false);
session_start();
    require "Article.php";
    class Response
    {
        public $status;
        public $errorCode=0;
        public $error;
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
    $type=$_POST['type'];
    $title=$_POST['title'];
    $tags=$_POST['tags'];
    $docType=$_POST['docType'];
    $doc=$_POST['doc'];
    try 
    {
        $article=new Article($title,$doc,"","");
        $article->type=$type;
        $article->tags=$tags;
        $article->docType=$docType;
        $article=Article::Post($article);
        $response->data=$article->pid;
        $response->status="^_^";
        $response->send();
    }
    catch (Exception $ex)
    {
        $response->errorCode=$ex->getCode ();
        $response->error=$ex->getMessage();
        $response->send();
    }
?>