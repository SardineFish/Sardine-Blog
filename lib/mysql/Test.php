<?php
require "const.php";
require "MySQL.php";
date_default_timezone_set('PRC'); 
echo date("Y-m-d H:i:s");
$mysql=new SarMySQL(HOST,UID,PWD,DB,PORT);
$cResult=$mysql->connect ();