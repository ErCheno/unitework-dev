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

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['espacio_trabajo_id']) || empty($input['usuario_id'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

$espacioTrabajoId = $input['espacio_trabajo_id'];
$usuarioId = $input['usuario_id'];

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
?>
