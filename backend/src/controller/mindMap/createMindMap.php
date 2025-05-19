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

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

$input = json_decode(file_get_contents("php://input"), true);
$titulo = trim($input['titulo'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');
$espacioTrabajoId = $input['espacio_trabajo_id'] ?? null;

// Validaciones
if (!$titulo || !$espacioTrabajoId) {
    echo json_encode([
        "success" => false,
        "message" => "El título y el ID del espacio de trabajo son obligatorios"
    ]);
    exit();
}

// Verificar que el usuario es miembro del espacio de trabajo
$stmt = $conn->prepare("SELECT id FROM miembros_espacios_trabajo WHERE espacio_trabajo_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $espacioTrabajoId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este espacio de trabajo"]);
    exit();
}
$stmt->close();

// Insertar el nuevo mapa mental
$stmt = $conn->prepare("INSERT INTO mapas_mentales (titulo, descripcion, espacio_trabajo_id, creado_por, fecha_creacion) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssis", $titulo, $descripcion, $espacioTrabajoId, $usuarioId);

if ($stmt->execute()) {
    $nuevoMapaId = $stmt->insert_id;
    $stmt->close();

    // Asignar al creador como admin del mapa mental
    $stmt = $conn->prepare("INSERT INTO miembros_mapas_mentales (mapa_mental_id, usuario_id, rol) VALUES (?, ?, 'admin')");
    $stmt->bind_param("is", $nuevoMapaId, $usuarioId);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Mapa mental creado correctamente",
        "mapa_mental_id" => $nuevoMapaId
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear el mapa mental: " . $stmt->error
    ]);
    $stmt->close();
}

$conn->close();
