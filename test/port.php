<?php
header("Cache-Control:no-cache");
echo $_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'];
?>