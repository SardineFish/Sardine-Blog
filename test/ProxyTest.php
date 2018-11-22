<?php
echo"IP:".$_SERVER["REMOTE_ADDR"].'<br>';

foreach (getallheaders() as $name => $value) {  
   echo "$name-----:$value</br>";  
} 

?>