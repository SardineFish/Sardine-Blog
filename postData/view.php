<?php
require "PostData.php";
$pid=$_GET["pid"];
if(!(int)$pid)
{
    exit();
}
PostDataBrowse::Add($pid,1);
?>