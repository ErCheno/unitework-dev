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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Verificar token
$usuario = verificarToken($conn);
if (!$usuario) {
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
    exit();
}

// Leer entrada
$input = json_decode(file_get_contents("php://input"), true);
if (empty($input['tablero_id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID del tablero']);
    exit();
}

$tablero_id = $conn->real_escape_string($input['tablero_id']);
$usuario_id = $usuario['id'];

// Verificar si el usuario pertenece al tablero
$stmt = $conn->prepare("SELECT * FROM miembros_tableros WHERE tablero_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $tablero_id, $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No perteneces a este tablero']);
    exit();
}
$stmt->close();

// Eliminar al usuario del tablero
$stmtDelete = $conn->prepare("DELETE FROM miembros_tableros WHERE tablero_id = ? AND usuario_id = ?");
$stmtDelete->bind_param("is", $tablero_id, $usuario_id);

// Eliminar invitación si existe
$stmt = $conn->prepare("DELETE FROM invitaciones WHERE email = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuario['email'], $tablero_id);

$stmt->execute();
$stmt->close();

if ($stmtDelete->execute()) {
    // Actualizar la última actividad del tablero
    $stmtUpdate = $conn->prepare("UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?");
    if ($stmtUpdate) {
        $stmtUpdate->bind_param("i", $tablero_id);
        $stmtUpdate->execute();
        $stmtUpdate->close();
    }

    echo json_encode(['success' => true, 'message' => 'Saliste del tablero exitosamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al salir del tablero']);
}

$stmtDelete->close();
$conn->close();
