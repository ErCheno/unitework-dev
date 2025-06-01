<?php
require_once "../../config/db.php"; 
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función para verificar token
function verificarToken($conn) {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        throw new Exception("Token no proporcionado");
    }

    // Extraer el token
    if (!preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        throw new Exception("Formato de token inválido");
    }

    $token = $matches[1];

    // Verificar token en la base de datos
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Token inválido o no encontrado");
    }

    // Verificar si el token está expirado
    $user = $result->fetch_assoc();
    if (isset($user['token_expiry']) && strtotime($user['token_expiry']) < time()) {
        throw new Exception("Token expirado");
    }

    return $user; // Devuelve los datos del usuario
}

try {
    // Verificar el token
    $user = verificarToken($conn);

    // Token válido
    echo json_encode([
        "status" => "success",
        "message" => "Token válido",
        "user" => [
            "id" => $user['id'],
            "nombre" => $user['nombre'],
            "email" => $user['email'],
        ]
    ]);
} catch (Exception $e) {
    // En caso de error, devolver mensaje adecuado
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
exit();
