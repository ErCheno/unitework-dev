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

$emailInvitado = $invitacion['email'] ?? null;
$remitenteId = $invitacion['remitente_id'] ?? null;

if (!$emailInvitado) {
    echo json_encode(["success" => false, "message" => "Invitación sin email"]);
    exit;
}

if (strtolower($userEmail) !== strtolower($emailInvitado)) {
    echo json_encode([
        "success" => false,
        "message" => "No autorizado para aceptar esta invitación"
    ]);
    exit;
}

// Obtener el ID real del usuario con ese email
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $emailInvitado);
$stmt->execute();
$resultUser = $stmt->get_result();
$stmt->close();

if ($resultUser->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario invitado no existe"]);
    exit;
}

$usuarioInvitado = $resultUser->fetch_assoc();

if ($usuarioInvitado['id'] !== $userId) {
    echo json_encode(["success" => false, "message" => "No autorizado para aceptar esta invitación"]);
    exit;
}

// Validar que tenga al menos espacio_trabajo_id y (tablero_id o mapa_id)
if (!$invitacion['espacio_trabajo_id'] || (empty($invitacion['tablero_id']) && empty($invitacion['mapa_id']))) {
    echo json_encode(["success" => false, "message" => "Invitación incompleta"]);
    exit;
}

$conn->begin_transaction();

try {
    // Insertar en miembros_espacios_trabajo
    $rolEspacio = $invitacion['rol'] ?? 'Miembro'; // Asumiendo que en invitacion rol es genérico para el workspace
    $stmt1 = $conn->prepare("INSERT IGNORE INTO miembros_espacios_trabajo (usuario_id, espacio_trabajo_id, rol) VALUES (?, ?, ?)");
    $stmt1->bind_param("sis", $userId, $invitacion['espacio_trabajo_id'], $rolEspacio);
    $stmt1->execute();

    if ($stmt1->affected_rows > 0) {
        $stmtUpdate = $conn->prepare("UPDATE espacios_trabajo SET numero_miembros = numero_miembros + 1 WHERE id = ?");
        $stmtUpdate->bind_param("i", $invitacion['espacio_trabajo_id']);
        $stmtUpdate->execute();
        $stmtUpdate->close();
    }
    $stmt1->close();

    $respuesta = [];

    // Si es invitación a tablero
    if (!empty($invitacion['tablero_id'])) {
        $rolTablero = $invitacion['rol'] ?? 'Miembro'; // Si tienes un rol específico para tablero, usa ese campo correcto
        $stmt2 = $conn->prepare("INSERT IGNORE INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
        $stmt2->bind_param("sis", $userId, $invitacion['tablero_id'], $rolTablero);
        $stmt2->execute();
        $stmt2->close();

        $respuesta = [
            "tablero_id" => $invitacion['tablero_id'],
            "tipo" => "tablero"
        ];
    } elseif (!empty($invitacion['mapa_id'])) {
        // Si es invitación a mapa mental
        $rolMapa = $invitacion['rol'] ?? 'Miembro'; // Mismo aquí, si tienes rol específico para mapa, ajusta
        $stmt3 = $conn->prepare("INSERT IGNORE INTO miembros_mapas_mentales (usuario_id, mapa_mental_id, rol) VALUES (?, ?, ?)");
        $stmt3->bind_param("sis", $userId, $invitacion['mapa_id'], $rolMapa);
        $stmt3->execute();
        $stmt3->close();

        $respuesta = [
            "mapa_id" => $invitacion['mapa_id'],
            "tipo" => "mapa"
        ];
    }

    // Marcar invitación como aceptada
    $stmt4 = $conn->prepare("UPDATE invitaciones SET estado = 'aceptada', fecha_aceptacion = NOW() WHERE id = ?");
    $stmt4->bind_param("i", $invitacionId);
    $stmt4->execute();
    $stmt4->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Invitación aceptada correctamente",
        "remitente_id" => $remitenteId,
        ...$respuesta
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error al procesar la invitación: " . $e->getMessage()
    ]);
}


$conn->close();
