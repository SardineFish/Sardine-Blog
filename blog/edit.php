<?php
session_start();
    define("DEBUG",false);
    require_once "Article.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    $type=$_POST['type'];
    $title=$_POST['title'];
    $tags=$_POST['tags'];
    $docType=$_POST['docType'];
    $doc=$_POST['doc'];
    $pid=$_POST["pid"];
    date_default_timezone_set('PRC'); 
    $time=date("Y-m-d H:i:s");
    try
    {
        $article = new Article($title,$doc,null,null);
        $article->pid = $pid;
        $article->type=$type;
        $article->tags=$tags;
        $article->docType=$docType;
        $article->doc=$doc;
        Article::Edit($article);
    }
    catch(Exception $ex)
    {
        $response->errorCode=$ex->getCode();
        $response->msg = $ex->getMessage();
        $response->send();
    }
    $response->status="^_^";
    $response->send();
?>