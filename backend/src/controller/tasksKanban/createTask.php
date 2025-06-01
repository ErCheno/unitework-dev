<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

// CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Leer datos del JSON de entrada
$input = json_decode(file_get_contents("php://input"), true);

// Validar campos obligatorios
$requeridos = ['tablero_id', 'estado_id', 'titulo'];
foreach ($requeridos as $campo) {
    if (empty($input[$campo])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Falta el campo obligatorio: $campo"]);
        exit();
    }
}

// Obtener campos con valores por defecto o nulos
$titulo        = trim($input['titulo']);
$descripcion   = $input['descripcion'] ?? null;
$fechaLimite   = $input['fecha_limite'] ?? null;
$prioridad     = $input['prioridad'] ?? 'media';
$color      = $input['color'] ?? null;
$asignadoA     = $input['asignado_a'] ?? null;
$tableroId     = (int)$input['tablero_id'];
$estadoId      = (int)$input['estado_id'];

// Calcular el siguiente orden dentro del estado si no se especifica
if (isset($input['orden'])) {
    $orden = (int)$input['orden'];
} else {
    $stmtOrden = $conn->prepare("SELECT MAX(orden) AS max_orden FROM tareas WHERE estado_id = ?");
    $stmtOrden->bind_param("i", $estadoId);
    $stmtOrden->execute();
    $resultadoOrden = $stmtOrden->get_result();
    $filaOrden = $resultadoOrden->fetch_assoc();
    $orden = ($filaOrden['max_orden'] ?? 0) + 1;
    $stmtOrden->close();
}


// Verificación del usuario autenticado
$usuario = verificarToken($conn);
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit();
}
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

// Obtener el estado_id y tablero_id desde la tabla estados_tareas
// Verificar que el estado exista y obtener su tablero asociado
$query = "SELECT tablero_id FROM estados_tareas WHERE id = ?";
$stmtEstado = $conn->prepare($query);

if (!$stmtEstado) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta de estado"]);
    exit();
}

$stmtEstado->bind_param("i", $estadoId);
$stmtEstado->execute();
$stmtEstado->store_result();

if ($stmtEstado->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El estado de tarea no existe"]);
    exit();
}

$stmtEstado->bind_result($estadoTableroId);
$stmtEstado->fetch();
$stmtEstado->close();

// Convertir ambos valores a enteros por seguridad antes de comparar
$estadoTableroId = (int)$estadoTableroId;
$tableroId = (int)$tableroId;

if ($estadoTableroId !== $tableroId) {
    // Solo para depuración: imprime y detiene (no lo dejes en producción)
    echo json_encode([
        "success" => false,
        "message" => "El estado de tarea no pertenece al tablero especificado",
        "debug" => [
            "estado_tablero_id" => $estadoTableroId,
            "tablero_id_enviado" => $tableroId
        ]
    ]);
    exit();
}

// Insertar la tarea
$sql = "
    INSERT INTO tareas (
        titulo, descripcion, fecha_creacion, fecha_limite, orden,
        prioridad, color, asignado_a, estado_id
    )
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en la preparación de la consulta"]);
    exit();
}

$stmt->bind_param(
    "ssisssii",
    $titulo,
    $descripcion,
    $fechaLimite,
    $orden,
    $prioridad,
    $color,
    $asignadoA,
    $estadoId,
);

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
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear la tarea"]);
}

$stmt->close();
$conn->close();
