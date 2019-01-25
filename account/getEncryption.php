<?php
define("DEBUG",true);
require "Account.php";
require_once "../lib/Utility.php";
$uid = $_GET['uid'];
$response=new Response();
try
{
    $account = Account::Get($uid);
    $response->data =$account->encryption;
    $response->status ="^_^";
    $response->send();
}
catch(Exception $ex)
{
    if($ex->getCode()==1010201001||$ex->getMessage()==1010201006)
    {
        $response->msg=$ex->getCode();
        $response->errorCode =$ex->getMessage();
    }
    else 
    {
        $response->msg="Error.";
        if(DEBUG)
        {
            $response->msg.=$ex->getMessage();
            $response->errorCode=$ex->getCode();
        }
    }
    $response->send();
}
?>