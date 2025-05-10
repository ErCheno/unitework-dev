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

// Leer el input
$input = json_decode(file_get_contents("php://input"), true);

// Validar campos obligatorios
if (empty($input['nombre']) || empty($input['tablero_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios: nombre o tablero_id"]);
    exit();
}

$nombre = trim($input['nombre']);
$tableroId = $input['tablero_id'];

// Verificar token
$usuario = verificarToken($conn);
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit();
}

$creadoPor = $usuario['id'];

// Paso 1: Obtener el valor máximo de posicionamiento actual para ese tablero
$sqlMaxPos = "SELECT MAX(posicionamiento) AS max_pos FROM estados_tareas WHERE tablero_id = ?";
$stmtMaxPos = $conn->prepare($sqlMaxPos);

if (!$stmtMaxPos) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta para obtener el máximo posicionamiento"]);
    exit();
}

$stmtMaxPos->bind_param("i", $tableroId);
$stmtMaxPos->execute();
$stmtMaxPos->store_result();
$stmtMaxPos->bind_result($maxPosicionamiento);
$stmtMaxPos->fetch();
$stmtMaxPos->close();

// Paso 2: Si no hay listas en el tablero, el valor máximo será NULL, entonces asignamos 1 como el primer valor
$nextPosicionamiento = $maxPosicionamiento ? $maxPosicionamiento + 1 : 1;

// Paso 3: Insertar la nueva lista con el posicionamiento calculado
$sql = "INSERT INTO estados_tareas (nombre, creado_por, tablero_id, posicionamiento) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta para insertar la nueva lista"]);
    exit();
}

$stmt->bind_param("ssii", $nombre, $creadoPor, $tableroId, $nextPosicionamiento);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Lista creada correctamente",
        "id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear la lista", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
