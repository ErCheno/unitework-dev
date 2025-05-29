<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

// Obtener datos JSON del body
$input = json_decode(file_get_contents("php://input"), true);
$tareaId = $input['tarea_id'] ?? null;

if (!$tareaId) {
    echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: tarea_id"]);
    exit();
}

// Verificar usuario autenticado
$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Verificar que el usuario tiene acceso a esa tarea (a través del tablero)
$query = "
    SELECT t.id, et.tablero_id
    FROM tareas t
    INNER JOIN estados_tareas et ON t.estado_id = et.id
    INNER JOIN miembros_tableros mt ON et.tablero_id = mt.tablero_id
    WHERE t.id = ? AND mt.usuario_id = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("is", $tareaId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes permiso para eliminar esta tarea o no existe"]);
    exit();
}

$stmt->close();

// Eliminar la tarea
$deleteStmt = $conn->prepare("DELETE FROM tareas WHERE id = ?");
$deleteStmt->bind_param("i", $tareaId);

$sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
$stmtUpdate = $conn->prepare($sqlUpdateActividad);
if ($stmtUpdate) {
    $stmtUpdate->bind_param("i", $tableroId);
    $stmtUpdate->execute();
    $stmtUpdate->close();
    // No hace falta manejar errores aquí a menos que quieras mostrar un warning
}

if ($deleteStmt->execute()) {
    echo json_encode(["success" => true, "message" => "Tarea eliminada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar la tarea"]);
}

$deleteStmt->close();
$conn->close();
