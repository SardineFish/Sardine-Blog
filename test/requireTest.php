<?php
//require "class.php";
//echo Classs::$x;
function x()
{
    if(!class_exists("Classs"))
    {
        require "class.php";
    }
    echo Classs::$x;

}
x();
?>