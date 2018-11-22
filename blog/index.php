<?php
if( $_GET['pid'])
{
/*header('HTTP/1.1 301 Moved Permanently');
header("Location: /blog?pid=".$_GET['pid']);
exit;*/
    readfile("blogView.html");
}
else {
    readfile("blog.html");
}
?>