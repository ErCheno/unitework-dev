<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener los datos JSON de la petición
$input = json_decode(file_get_contents("php://input"), true);
$tareaId = $input['id'] ?? null;
$titulo = $input['titulo'] ?? null;
$descripcion = $input['descripcion'] ?? null;
$color = $input['color'] ?? null;

if (!$tareaId) {
    echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: id"]);
    exit();
}

// Verificación del usuario autenticado
$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Obtener el tablero de la tarea para validar permisos
$stmt = $conn->prepare("
    SELECT ta.id AS tablero_id
    FROM tareas t
    INNER JOIN estados_tareas et ON t.estado_id = et.id
    INNER JOIN tableros ta ON et.tablero_id = ta.id
    WHERE t.id = ?
");
$stmt->bind_param("i", $tareaId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Tarea no encontrada"]);
    exit();
}

$row = $result->fetch_assoc();
$tableroId = $row['tablero_id'];

// Verificar que el usuario pertenece al tablero
$stmtPermiso = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmtPermiso->bind_param("si", $usuarioId, $tableroId);
$stmtPermiso->execute();
$resPermiso = $stmtPermiso->get_result();

if ($resPermiso->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes permisos para editar esta tarea"]);
    exit();
}

// Preparar la actualización
$stmtUpdate = $conn->prepare("
    UPDATE tareas
    SET titulo = ?, descripcion = ?, color = ?
    WHERE id = ?
");
$stmtUpdate->bind_param("sssi", $titulo, $descripcion, $color, $tareaId);

if ($stmtUpdate->execute()) {
    echo json_encode(["success" => true, "message" => "Tarea actualizada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar la tarea"]);
}

// Cierre de conexiones
$stmt->close();
$stmtPermiso->close();
$stmtUpdate->close();
$conn->close();
?>
