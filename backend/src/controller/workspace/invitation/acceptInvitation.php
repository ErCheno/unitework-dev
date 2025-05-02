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

if (!$invitacion['espacio_trabajo_id'] || !$invitacion['tablero_id']) {
    echo json_encode(["success" => false, "message" => "Invitación incompleta"]);
    exit;
}

$conn->begin_transaction();

try {
    // Insertar en miembros_espacios_trabajo (si no existe)
    $stmt1 = $conn->prepare("INSERT IGNORE INTO miembros_espacios_trabajo (usuario_id, espacio_trabajo_id, rol) VALUES (?, ?, ?)");
    $stmt1->bind_param("sis", $userId, $invitacion['espacio_trabajo_id'], $invitacion['rol_espacio_trabajo']);
    $stmt1->execute();
    $stmt1->close();

    // Insertar en miembros_tableros (si no existe)
    $stmt2 = $conn->prepare("INSERT IGNORE INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
    $stmt2->bind_param("sis", $userId, $invitacion['tablero_id'], $invitacion['rol_tablero']);
    $stmt2->execute();
    $stmt2->close();

    // Marcar invitación como aceptada
    $stmt3 = $conn->prepare("UPDATE invitaciones SET estado = 'aceptada', fecha_aceptacion = NOW() WHERE id = ?");
    $stmt3->bind_param("i", $invitacionId);
    $stmt3->execute();
    $stmt3->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Invitación aceptada correctamente",
        "tablero_id" => $invitacion['tablero_id'],
        "remitente_id" => $remitenteId
    ]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al procesar la invitación"]);
}

$conn->close();

?>
