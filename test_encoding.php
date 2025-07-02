<?php
header('Content-Type: text/html; charset=UTF-8');
echo "PHP動作確認 - UTF-8";
echo "<br>PHP Version: " . phpversion();
echo "<br>Default Charset: " . ini_get('default_charset');
echo "<br>Internal Encoding: " . mb_internal_encoding();
?>
