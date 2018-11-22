<?php
//?Generate?a?new?private?(and?public)?key?pair
$pkey?=?openssl_pkey_new();
$keyStr="";
openssl_pkey_export($pkey?,$keyStr);
echo $keyStr;

?>