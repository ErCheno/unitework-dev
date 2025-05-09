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
$orden         = $input['orden'] ?? 0;
$prioridad     = $input['prioridad'] ?? 'media';
$etiqueta      = $input['etiqueta'] ?? null;
$asignadoA     = $input['asignado_a'] ?? null;
$tableroId     = $input['tablero_id'];
$estadoId      = $input['estado_id'];

// Verificación del usuario autenticado
$usuario = verificarToken($conn);
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit();
}
$usuarioId = $usuario['id'];

// Insertar la tarea
$sql = "
    INSERT INTO tareas (
        titulo, descripcion, fecha_creacion, fecha_limite, orden,
        prioridad, etiqueta, asignado_a, tablero_id, estado_id, creado_por
    )
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error en la preparación de la consulta"]);
    exit();
}

$stmt->bind_param(
    "sssisssiiis",
    $titulo,
    $descripcion,
    $fechaLimite,
    $orden,
    $prioridad,
    $etiqueta,
    $asignadoA,
    $tableroId,
    $estadoId,
    $usuarioId
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Tarea creada correctamente",
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear la tarea", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
