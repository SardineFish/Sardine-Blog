<?php
require_once "./Note.php";
require_once "../lib/Response.php";
session_start();

$startIdx = $_GET["startIdx"];
$time = $_GET["time"];
$count = $_GET["count"];
$incViews = false;
if(!$_SESSION["viewed"])
{
    $incViews = true;
    $_SESSION["viewed"] = true;
}
$response = new Response();
try
{
    $result = NoteBoard::GetList($time, $startIdx, $count, $incViews);
    $response->send($result);
}
catch(Excpetion $ex)
{
    $response->error($ex->getMessage(), $ex->getCode());
}


?>