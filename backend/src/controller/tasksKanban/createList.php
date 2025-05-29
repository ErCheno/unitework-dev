<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

// CORS
require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$nextPosicionamiento = $maxPosicionamiento ? $maxPosicionamiento + 1 : 1;
$color = null;

// Paso 2: Insertar la nueva lista
$sql = "INSERT INTO estados_tareas (nombre, creado_por, tablero_id, posicionamiento, color) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta para insertar la nueva lista"]);
    exit();
}

$stmt->bind_param("ssiis", $nombre, $creadoPor, $tableroId, $nextPosicionamiento, $color);

if ($stmt->execute()) {
    $nuevoEstadoId = $stmt->insert_id;
    $stmt->close();

    // Paso 3: Obtener los datos completos del nuevo estado
    $sqlEstado = "SELECT id, nombre, creado_por, tablero_id, posicionamiento, color FROM estados_tareas WHERE id = ?";
    $stmtEstado = $conn->prepare($sqlEstado);

    if (!$stmtEstado) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta para obtener la lista creada"]);
        exit();
    }

    $stmtEstado->bind_param("i", $nuevoEstadoId);
    $stmtEstado->execute();
    $resultado = $stmtEstado->get_result();
    $estado = $resultado->fetch_assoc();
    $stmtEstado->close();

    // Paso 4: Actualizar ultima_actividad del tablero
    $sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
    $stmtUpdate = $conn->prepare($sqlUpdateActividad);
    if ($stmtUpdate) {
        $stmtUpdate->bind_param("i", $tableroId);
        $stmtUpdate->execute();
        $stmtUpdate->close();
        // No hace falta manejar errores aquí a menos que quieras mostrar un warning
    }

    echo json_encode([
        "success" => true,
        "message" => "Lista creada correctamente",
        "estado" => $estado
    ]);


} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al crear la lista", "error" => $stmt->error]);
    $stmt->close();
}

$conn->close();
