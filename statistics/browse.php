<?php
define("DEBUG",false);
    class Browse
    {
        public static function Add($type,$id,$mysql=null)
        {
            return Statistics::Set("browse ".$type.$id,'+',1,true,$mysql);
        }
        public static function Get($type,$id,$mysql=null)
        {
            return Statistics::Set("browse ".$type.$id,'+',1,false,$mysql);
        }
    }
    if(!is_bool(FUNCTION_ONLY)||FUNCTION_ONLY==false)
    {
        class Response
        {
            public $status;
            public $msg;
            public $data;
            function __construct()
            {
                $this->status=">_<";
                $this->msg="";
                $this->data=0;
            }
            public function send()
            {
                echo json_encode($this);
                exit();
            }
        }
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
            $result=Browse::Get($type,$id);
            if(!$result->succeed)
            {
                if($result->errno==1010202001)
                {
                    if($type=='note')
                    {
                        $get=Note::Get($id);
                        if($get)
                        {
                            Browse::Add('note',$id);
                            $response->data=1;
                            $response->status="^_^";
                            $response->send();
                        }
                    }
                    else if($type=='works')
                    {
                        $get=Works::Get($id);
                        if($get)
                        {
                            Browse::Add('works',$id);
                            $response->data=1;
                            $response->status="^_^";
                            $response->send();
                        }
                    }
                    else if($type=='article')
                    {
                        $get=Article::Get($id);
                        if($get)
                        {
                            Browse::Add('article',$id);
                            $response->data=1;
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