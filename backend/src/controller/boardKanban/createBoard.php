<?php
require_once "../../config/db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['nombre']) || empty($input['creado_por'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

$nombre = $input['nombre'];
$descripcion = $input['descripcion'] ?? '';
$creado_por = $input['creado_por'];
$espacio_trabajo_id = $input['espacio_trabajo_id'];
$fecha_creacion = date('Y-m-d H:i:s');

// Insertar el tablero
$stmt = $conn->prepare("INSERT INTO tableros (nombre, descripcion, espacio_trabajo_id, creado_por, fecha_creacion) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssiss", $nombre, $descripcion, $espacio_trabajo_id, $creado_por, $fecha_creacion);

if ($stmt->execute()) {
    $tablero_id = $conn->insert_id;

    // Insertar al creador como miembro del tablero con rol 'admin'
    $rol = 'admin';
    $stmt_miembro = $conn->prepare("INSERT INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
    $stmt_miembro->bind_param("sis", $creado_por, $tablero_id, $rol);

    if ($stmt_miembro->execute()) {
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
