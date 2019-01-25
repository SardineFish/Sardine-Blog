<?php
define("DEBUG",false);
    class Count
    {
        public static function Get($x)
        {
            $result=Statistics::Get('count '.$x);
            if(!$result->succeed&&$result->errno==1010202001)
            {
                return Statistics::Add('count '.$x);
            }
            return $result;
        }
        public static function Add($x, $value=1)
        {
            return Statistics::Set('count '.$x, '+', $value, true);
        }
    }
    require_once "../lib/Utility.php";
    if(!is_bool(FUNCTION_ONLY)||FUNCTION_ONLY==false)
    {
        require "../lib/mysql/const.php";
        require "../lib/mysql/MySQL.php";
        require "Statistics.php";
        $response=new Response();
        $x=$_GET['x'];
        if($x==""||!$x)
        {
            $response->msg="Parameter error.";
            $response->send();
        }
        $result=Count::Get($x);
        if(!$result->succeed)
        {
            $response->msg="Getting count of ".$x." error.";
            if(DEBUG)
                $response->msg.=$result->error;
            $response->send();
        }
        $response->data=$result->value;
        $response->status="^_^";
        $response->send();
    }
?>