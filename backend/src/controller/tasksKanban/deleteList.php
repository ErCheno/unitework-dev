<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['estado_id']) || empty($input['tablero_id'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]);
    exit();
}

$estadoId = $input['estado_id'];
$tableroId = $input['tablero_id'];

// Verificar autenticación
$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Verificar que el usuario pertenece al tablero
$stmt = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuarioId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso a este tablero"]);
    exit();
}
$stmt->close();

// Eliminar la lista (estado)
$stmt = $conn->prepare("DELETE FROM estados_tareas WHERE id = ? AND tablero_id = ?");
$stmt->bind_param("ii", $estadoId, $tableroId);

$sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
$stmtUpdate = $conn->prepare($sqlUpdateActividad);
if ($stmtUpdate) {
    $stmtUpdate->bind_param("i", $tableroId);
    $stmtUpdate->execute();
    $stmtUpdate->close();
    // No hace falta manejar errores aquí a menos que quieras mostrar un warning
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Lista eliminada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar la lista"]);
}

$stmt->close();
$conn->close();
