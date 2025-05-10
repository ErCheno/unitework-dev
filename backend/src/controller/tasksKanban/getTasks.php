<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener los datos de la solicitud (tablero_id y estado_id opcional)
$input = json_decode(file_get_contents("php://input"), true);
$tableroId = $input['tablero_id'] ?? null;
$estadoId = $input['estado_id'] ?? null; // opcional

if (!$tableroId) {
    echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: tablero_id"]);
    exit();
}

// Verificación del usuario autenticado
$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Verificar que el usuario pertenece al tablero
$stmt = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuarioId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este tablero"]);
    exit();
}

// Construir la consulta de tareas, si se pasa un estado_id, filtramos también por eso
$query = "
    SELECT 
        t.id, 
        t.titulo, 
        t.descripcion, 
        t.estado_id, 
        t.asignado_a, 
        t.fecha_creacion, 
        t.fecha_limite, 
        t.orden, 
        t.prioridad, 
        t.etiqueta, 
        e.nombre AS estado
    FROM tareas t
    LEFT JOIN estados_tareas et ON t.estado_id = et.id
    LEFT JOIN tableros ta ON et.tablero_id = ta.id
    LEFT JOIN estados_tareas e ON t.estado_id = e.id
    WHERE et.tablero_id = ?
";

if ($estadoId) {
    $query .= " AND t.estado_id = ?";
}

$query .= " ORDER BY t.orden ASC";

// Preparar la consulta
$stmtTareas = $conn->prepare($query);

// Si se pasa un estado_id, lo agregamos como parámetro
if ($estadoId) {
    $stmtTareas->bind_param("ii", $tableroId, $estadoId);
} else {
    $stmtTareas->bind_param("i", $tableroId);
}

$stmtTareas->execute();
$resultTareas = $stmtTareas->get_result();

// Verificar si se encontraron tareas
if ($resultTareas->num_rows > 0) {
    $tareas = [];
    while ($tarea = $resultTareas->fetch_assoc()) {
        $tareas[] = $tarea;
    }
    echo json_encode(["success" => true, "tasks" => $tareas]);
} else {
    // ✅ Devuelve un array vacío en lugar de un error
    echo json_encode(["success" => true, "tasks" => []]);
}

$stmtTareas->close();
$stmt->close();
$conn->close();
?>
