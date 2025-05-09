<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (
    !$input || empty($input['tablero_id']) || empty($input['titulo']) ||
    !isset($input['estado_id']) || !isset($input['orden']) || empty($input['prioridad'])
) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

$titulo = $input['titulo'];
$descripcion = $input['descripcion'] ?? null;
$tableroId = $input['tablero_id'];
$estadoId = $input['estado_id'];
$fechaLimite = $input['fecha_limite'] ?? null;
$orden = $input['orden'];
$prioridad = $input['prioridad']; // 'baja', 'media' o 'alta'

// Verificar que el usuario pertenece al tablero
$stmt = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuarioId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este tablero"]);
    exit();
}

// Insertar la tarea
$stmt = $conn->prepare("INSERT INTO tareas (titulo, descripcion, tablero_id, estado_id, fecha_limite, orden, prioridad)
                        VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiiss", $titulo, $descripcion, $tableroId, $estadoId, $fechaLimite, $orden, $prioridad);

if ($stmt->execute()) {
    $tareaId = $stmt->insert_id;

    // Obtener espacio_trabajo_id asociado al tablero
    $stmtEspacio = $conn->prepare("SELECT espacio_trabajo_id FROM tableros WHERE id = ?");
    $stmtEspacio->bind_param("i", $tableroId);
    $stmtEspacio->execute();
    $resultadoEspacio = $stmtEspacio->get_result();
    $espacioTrabajoId = $resultadoEspacio->fetch_assoc()['espacio_trabajo_id'];
    $stmtEspacio->close();

    // Actualizar ultima_actividad del tablero
    $conn->query("UPDATE tableros SET ultima_actividad = NOW() WHERE id = $tableroId");

    // Actualizar ultima_actividad del espacio de trabajo
    $conn->query("UPDATE espacios_trabajo SET ultima_actividad = NOW() WHERE id = $espacioTrabajoId");

    echo json_encode([
        "success" => true,
        "message" => "Tarea creada correctamente",
        "task_id" => $tareaId
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear la tarea"]);
}

$stmt->close();
$conn->close();
