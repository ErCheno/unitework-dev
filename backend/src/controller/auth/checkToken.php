<?php
require_once "../../config/db.php"; 
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si se recibe la cabecera Authorization
$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    die(json_encode(["status" => "error", "message" => "No se proporcionó el token de autorización"]));
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

// Verificar si la conexión a la base de datos está establecida
if (!$conn) {
    die(json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]));
}

// Comprobar si el token existe en la base de datos
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

// Si no se encuentra el token en la base de datos
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Token inválido o expirado"]);
    exit();
}

// Si se encuentra el token, verificar su validez (por ejemplo, si ha caducado)
$user = $result->fetch_assoc();
if (isset($user['token_expiry']) && strtotime($user['token_expiry']) < time()) {
    echo json_encode(["status" => "error", "message" => "Token expirado"]);
    exit();
}

// Si el token es válido
echo json_encode([
    "status" => "success",
    "message" => "Token válido",
    "user" => $user
]);

$stmt->close();  // Cerrar la sentencia
$conn->close();  // Cerrar la conexión a la base de datos
exit();
