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

// Obtener headers (funciona en Apache y otras configuraciones)
$headers = getallheaders();

// Verificar si se recibe la cabecera Authorization
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "No se proporcionó el token de autorización"]);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

// Verificar conexión a la base de datos
if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
    exit();
}

// Buscar el token en la base de datos
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

// Token inválido
if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token inválido o no encontrado"]);
    exit();
}

// Verificar fecha de expiración
$user = $result->fetch_assoc();
if (isset($user['token_expiry']) && strtotime($user['token_expiry']) < time()) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Token expirado"]);
    exit();
}

// Token válido
echo json_encode([
    "status" => "success",
    "message" => "Token válido",
    "user" => [
        "id" => $user['id'],
        "nombre" => $user['nombre'],
        "email" => $user['email'],
        "rol" => $user['rol'],
    ]
]);

$stmt->close();
$conn->close();
exit();
function verificarToken($conn) {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        throw new Exception("Token no proporcionado");
    }

    if (!preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        throw new Exception("Formato de token inválido");
    }

    $token = $matches[1];

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE token = ? AND token_expira > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Token inválido o expirado");
    }

    $usuario = $result->fetch_assoc();
    return $usuario['id']; // Devuelve el ID del usuario autenticado
}
