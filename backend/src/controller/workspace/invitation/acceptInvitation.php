<?php

require_once __DIR__ . '/../../../config/db.php';
require_once "../../auth/tokenUtils.php";

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

$userId = verificarToken($conn); // Obtiene el ID del usuario autenticado

$input = json_decode(file_get_contents('php://input'), true);
$invitacionId = $input['invitacion_id'] ?? null;

if (!$invitacionId) {
    echo json_encode(["success" => false, "message" => "Falta el ID de la invitación"]);
    exit;
}

// Obtener la invitación
$stmt = $conn->prepare("SELECT * FROM invitaciones WHERE id = ? AND estado = 'pendiente'");
$stmt->bind_param("i", $invitacionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invitación no válida o ya procesada"]);
    exit;
}

$invitacion = $result->fetch_assoc();
$stmt->close();
if ((int)$invitacion['usuario_invitado_id'] !== $userId) {
    echo json_encode(["success" => false, "message" => "No autorizado para aceptar esta invitación"]);
    exit;
}

if (!$invitacion['espacio_trabajo_id'] || !$invitacion['tablero_id']) {
    echo json_encode(["success" => false, "message" => "Invitación incompleta"]);
    exit;
}
// Insertar al usuario como miembro en el espacio de trabajo y en el tablero
$conn->begin_transaction();




try {
    // Insertar en miembros_espacios_trabajo
    $stmt1 = $conn->prepare("INSERT IGNORE INTO miembros_espacios_trabajo (usuario_id, espacio_trabajo_id, rol) VALUES (?, ?, ?)");
    $stmt1->bind_param("iis", $userId, $invitacion['espacio_trabajo_id'], $invitacion['rol_espacio_trabajo']);
    $stmt1->execute();
    $stmt1->close();

    // Insertar en miembros_tableros
    $stmt2 = $conn->prepare("INSERT IGNORE INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
    $stmt2->bind_param("iis", $userId, $invitacion['tablero_id'], $invitacion['rol_tablero']);
    $stmt2->execute();
    $stmt2->close();

    // Marcar invitación como aceptada
    $stmt3 = $conn->prepare("UPDATE invitaciones SET estado = 'aceptada', fecha_respuesta = NOW() WHERE id = ?");
    $stmt3->bind_param("i", $invitacionId);
    $stmt3->execute();
    $stmt3->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Invitación aceptada correctamente",
        "tablero_id" => $invitacion['tablero_id']
    ]);
    } catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al procesar la invitación"]);
}

$conn->close();
