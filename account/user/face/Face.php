<?php
class FaceResult
{
    public $succeed=false;
    public $errno=0;
    public $error="";
    public $face=null;
}
/**
 * Face short summary.
 *
 * Face description.
 *
 * @version 1.0
 * @author Sardi
 */
class Face
{
    public $url;
    public static function GetFace($uid,$mysql=null)
    {
        if(!class_exists("Users"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/user/Users.php";
        }

        return Users::GetUser($uid,$mysql);
    }

    public static function ChangeFace($uid,$url,$mysql=null)
    {
        $r=new FaceResult();
        if(!class_exists("Users"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/user/Users.php";
        }
        if(!class_exists("Account"))
        {
            require $_SERVER['DOCUMENT_ROOT']."/account/Account.php";
        }

        $result=Account::CheckLogin($mysql);
        if(!$result->succeed)
        {
            $r->error = $result->error;
            $r->errno=$result->errno;
            return $r;
        }

        $result=Users::Edit ($uid,"icon",$url,$mysql);
        if(!$result->succeed)
        {
            $r->error = $result->error;
            $r->errno=$result->errno;
            return $r;
        }
        
        $r->succeed=true;
        return $r;
    }
}
