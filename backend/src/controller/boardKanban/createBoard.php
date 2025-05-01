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

$input = json_decode(file_get_contents('php://input'), true);

// Verificar token y obtener el ID del usuario autenticado
try {
    $usuarioId = verificarToken($conn);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit();
}

// Validar datos de entrada
if (!$input || empty($input['nombre']) || empty($input['espacio_trabajo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit();
}

$nombre = $input['nombre'];
$descripcion = $input['descripcion'] ?? '';
$espacio_trabajo_id = $input['espacio_trabajo_id'];
$fecha_creacion = date('Y-m-d H:i:s');

// Insertar el tablero
$stmt = $conn->prepare("INSERT INTO tableros (nombre, descripcion, espacio_trabajo_id, creado_por, fecha_creacion) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssiss", $nombre, $descripcion, $espacio_trabajo_id, $usuarioId, $fecha_creacion);

if ($stmt->execute()) {
    $tablero_id = $conn->insert_id;

    // Añadir al creador como miembro con rol 'admin'
    $rol = 'admin';
    $stmt_miembro = $conn->prepare("INSERT INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
    $stmt_miembro->bind_param("sis", $usuarioId, $tablero_id, $rol);

    if ($stmt_miembro->execute()) {
        $stmt_update = $conn->prepare("UPDATE espacios_trabajo SET numero_tableros = numero_tableros + 1, ultima_actividad = NOW() WHERE id = ?");
        $stmt_update->bind_param("i", $espacio_trabajo_id);
        $stmt_update->execute();
        $stmt_update->close();

        echo json_encode(['success' => true, 'message' => 'Tablero y miembro creados correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Tablero creado, pero error al añadir miembro']);
    }

    $stmt_miembro->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error al crear el tablero']);
}

$stmt->close();
$conn->close();
