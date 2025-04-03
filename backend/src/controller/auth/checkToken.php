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

$stmt = $conn->prepare("SELECT * FROM usuarios WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

// Comprobar si el token está presente en la base de datos
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();  // Obtener el usuario con el token
    echo json_encode(["status" => "success", "message" => "Token válido", "user" => $user]);  // Devolver éxito y los datos del usuario
} else {
    echo json_encode([
        "status" => "success", // O "error" en caso de fallo
        "user" => ["id" => $user_id, "nombre" => $user_nombre],
        "message" => "Token válido o expirado"
    ]);
    }
$stmt->close();  // Cerrar la sentencia
$conn->close();  // Cerrar la conexión a la base de datos
exit();
