<?php
require_once "../../config/db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$usuarioId = verificarToken($conn); // Llamada a la función que obtiene el ID del usuario del token

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['espacio_trabajo_id'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

$espacioTrabajoId = $input['espacio_trabajo_id'];

// Validar si el usuario es administrador de ese espacio
$stmt = $conn->prepare("SELECT rol FROM miembros_espacios_trabajo WHERE usuario_id = ? AND espacio_trabajo_id = ?");
$stmt->bind_param("si", $usuarioId, $espacioTrabajoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este espacio"]);
    exit();
}

$row = $result->fetch_assoc();
if ($row['rol'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Solo un administrador puede eliminar el espacio"]);
    exit();
}

// Primero elimina relaciones dependientes (tableros, mapas, miembros... si lo deseas)
$stmt = $conn->prepare("DELETE FROM espacios_trabajo WHERE id = ?");
$stmt->bind_param("i", $espacioTrabajoId);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "Espacio eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar"]);
}

$stmt->close();
$conn->close();

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


?>
