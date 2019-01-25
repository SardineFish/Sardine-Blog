<?php
    define("DEBUG",false);
    class Like
    {
        public static function Add($type,$id,$add=1,$mysql=null)
        {
            return Statistics::Set("like ".$type.$id,'+',$add,true,$mysql);
        }
        public static function Get($type,$id,$mysql=null)
        {
            return Statistics::Get("like ".$type.$id,$mysql);
        }
    }
    
    if(!is_bool(FUNCTION_ONLY)||FUNCTION_ONLY==false)
    {
        require_once "../lib/Utility.php";
        require "../lib/mysql/const.php";
        require "../lib/mysql/MySQL.php";
        require "Statistics.php";
        require "../note/Note.php";
        require "../blog/Article.php";
        require "../works/Works.php";
        $response=new Response();
        try
        {
            $type=$_GET['type'];
            $id=$_GET['id'];
            $methor=$_GET['methor'];
            if($methor=='add')
            {
                $result=Like::Add($type,$id);
                if(!$result->succeed)
                {
                    $response->msg="Like adding error.";
                    if(DEBUG)
                        $response->msg.=$result->error;
                    $response->data=0;
                    $response->send();
                }
                $response->data=$result->value;
                $response->status="^_^";
                $response->send();
            }
            $result=Like::Get($type,$id);
            if(!$result->succeed)
            {
                if($result->errno==1010202001)
                {
                    if($type=='note')
                    {
                        $get=Note::Get($id);
                        if($get)
                        {
                            Like::Add('note',$id,0);
                            $response->data=0;
                            $response->status="^_^";
                            $response->send();
                        }
                    }
                    else if($type=='works')
                    {
                        $get=Works::Get($id);
                        if($get)
                        {
                            Like::Add('works',$id,0);
                            $response->data=0;
                            $response->status="^_^";
                            $response->send();
                        }
                    }
                    else if($type=='article')
                    {
                        $get=Article::Get($id);
                        if($get)
                        {
                            Like::Add('article',$id,0);
                            $response->data=0;
                            $response->status="^_^";
                            $response->send();
                        }
                    }
                    $response->msg=$result->error;
                }
                else
                {
                    $response->msg="Getting error.";
                    if(DEBUG)
                        $response->msg.=$result->error;
                }
                $response->send();
            }
            $response->data=$result->value;
            $response->status="^_^";
            $response->send();
        }
        catch(Exception $ex)
        {
            
        }
    }
?>