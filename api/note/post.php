<?php
error_reporting(E_ERROR);
require_once "./Note.php";
require_once "../lib/Response.php";
$name = $_POST['author'];
$email = $_POST['email'];
$url = $_POST['url'];
$text = $_POST['text'];

$response = new Response();

try
{
    $pid = NoteBoard::Post($text, $name, $email, $url);
    $response->send($pid);
}
catch (Exception $ex)
{
    $response->error($ex->getMessage(), $ex->getCode());
}

?>