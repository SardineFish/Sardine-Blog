<?php
    define("DEBUG",false);
    class Download
    {
        public static function Add($type,$id,$add=1)
        {
            return Statistics::Set("download ".$type.$id,'+',$add,true);
        }
        public static function Get($type,$id)
        {
            return Statistics::Get("download ".$type.$id);
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
        require "../works/Works.php";
        $response=new Response();
        try
        {
            
            $type=$_GET['type'];
            $id=$_GET['id'];
            $methor=$_GET['methor'];
            if($methor=='add')
            {
                $result=Download::Add($type,$id);
                if(!$result->succeed)
                {
                    $response->msg="Download adding error.";
                    if(DEBUG)
                        $response->msg.=$result->error;
                    $response->data=0;
                    $response->send();
                }
                $response->data=$result->value;
                $response->status="^_^";
                $response->send();
            }
            $result=Download::Get($type,$id);
            if(!$result->succeed)
            {
                if($result->errno==1010202001)
                {
                    if($type=='works')
                    {
                        $get=Works::Get($id);
                        if($get)
                        {
                            Download::Add('works',$id,0);
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