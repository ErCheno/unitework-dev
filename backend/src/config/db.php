<?php
$host = "localhost";
$dbname = "unitework";
$user = "root";
$password = "";

$conn = mysqli_connect($host, $user, $password, $dbname);

if (!$conn) {
    die("Error de conexión: " . mysqli_connect_error());
}
?>
