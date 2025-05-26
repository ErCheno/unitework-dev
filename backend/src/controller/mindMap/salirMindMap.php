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
if (empty($input['mapa_id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID del mapa mental']);
    exit();
}

$mapa_id = $conn->real_escape_string($input['mapa_id']);
$usuario_id = $usuario['id'];

// Verificar si el usuario pertenece al mapa mental
$stmt = $conn->prepare("SELECT * FROM miembros_mapas_mentales WHERE mapa_mental_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $mapa_id, $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No perteneces a este mapa mental']);
    exit();
}
$stmt->close();

// Iniciar transacción
$conn->begin_transaction();

try {
    // Eliminar al usuario del mapa mental
    $stmt = $conn->prepare("DELETE FROM miembros_mapas_mentales WHERE mapa_mental_id = ? AND usuario_id = ?");
    $stmt->bind_param("is", $mapa_id, $usuario_id);
    $stmt->execute();
    $stmt->close();

    // Eliminar invitación si existe
$stmt = $conn->prepare("DELETE FROM invitaciones WHERE email = ? AND mapa_id = ?");
$stmt->bind_param("si", $usuario['email'], $mapa_id);
$stmt->execute();
$stmt->close();
    // Confirmar transacción
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Saliste del mapa mental exitosamente y se eliminó la invitación asociada']);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al salir del mapa mental']);
}

$conn->close();
?>
