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

$usuario = verificarToken($conn);
$userId = $usuario['id'];
$userEmail = $usuario['email'];

$input = json_decode(file_get_contents('php://input'), true);
$invitacionId = $input['invitacion_id'] ?? null;

if (!$invitacionId) {
    echo json_encode(["success" => false, "message" => "Falta el ID de la invitación"]);
    exit;
}

// Verifica que la invitación existe, está pendiente y corresponde al usuario
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

if (strtolower($usuario['email']) !== strtolower($invitacion['email'])) {
    echo json_encode(["success" => false, "message" => "No autorizado para rechazar esta invitación"]);
    exit;
}

// Rechazar la invitación (actualizar estado y fecha de acción)
$stmt = $conn->prepare("UPDATE invitaciones SET estado = 'rechazada', fecha_aceptacion = NOW() WHERE id = ?");
$stmt->bind_param("i", $invitacionId);
$success = $stmt->execute();
$stmt->close();

if ($success) {
    echo json_encode(["success" => true, "message" => "Invitación rechazada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al rechazar la invitación"]);
}

$conn->close();
