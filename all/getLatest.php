<?php
    require "All.php";
    require_once "../lib/Utility.php";
    $response=new Response();
    
    $page=$_GET['page'];
    $count=$_GET['count'];
    $page = (int)$page;
    if(!$page)
        $page=1;
    $count=(int)$count;
    if(!is_int($count))
    {
        $count=0;
    }
    $result=All::GetLatest(($page-1)*$count ,$count);
    if(!$result->succeed )
    {
        $response->errorCode =$result->errno;
        $response->msg = "��ȡʧ��";
        $response->data =array ();
        $response->send ();
    }
    $response->data = $result->data ;
    $response->status ="^_^";
    $response->send ();

?>