<?php
$res=openssl_pkey_new();

// Get private key
openssl_pkey_export($res, $privkey);

// Get public key
$pubkey=openssl_pkey_get_details($res);
$pubkey=$pubkey["key"];

echo $pubkey;
echo "<br>";
echo $privkey;
?>