<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once "../lib/php/PHPMailer-6.0.3/src/Exception.php";
require_once '../lib/php/PHPMailer-6.0.3/src/PHPMailer.php';
require_once '../lib/php/PHPMailer-6.0.3/src/SMTP.php';

require_once "../config.php";

$mail = new PHPMailer(true);
try{
    $mail->SMTPDebug = 2;                                 // Enable verbose debug output
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = MAIL_HOST;  // Specify main and backup SMTP servers
    $mail->SMTPAuth = true;                               // Enable SMTP authentication
    $mail->Username = MAIL_REPLY_ADDRESS;                 // SMTP username
    $mail->Password = MAIL_REPLY_PWD;                           // SMTP password
    $mail->Port = MAIL_PORT; 
    //$mail->SMTPSecure = 'tls'; 

    //Recipients
    $mail->setFrom(MAIL_REPLY_ADDRESS, 'SardineFish');
    $mail->addAddress('sardine@live.cn', "");     // Add a recipient

    //Content
    $mail->isHTML(true);                                  // Set email format to HTML
    $mail->Subject = '中文标题测试';
    $mail->Body    = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    中文HTML测试
</body>
</html>';
    $mail->AltBody = '这是一条测试';

    $mail->send();
    echo 'Message has been sent';
}
catch(Exception $ex){
    echo $ex->getMessage();
}
?>