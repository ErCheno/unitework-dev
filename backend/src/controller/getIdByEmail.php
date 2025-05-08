<?php

require_once __DIR__ . '/../config/db.php';
require_once "./auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

// Obtener el usuario autenticado
$usuario = verificarToken($conn);

// Leer el cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    echo json_encode(["success" => false, "message" => "Falta el parámetro 'email'"]);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    echo json_encode(["success" => false, "message" => "Email inválido"]);
    exit;
}

// Buscar el ID del usuario por email
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "usuario_id" => $row['id']]);
} else {
    echo json_encode(["success" => false, "message" => "No se encontró un usuario con ese email"]);
}

$stmt->close();
$conn->close();
