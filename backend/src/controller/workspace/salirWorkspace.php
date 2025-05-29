<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$usuario = verificarToken($conn);
if (!$usuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
if (empty($input['espacio_trabajo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID del espacio de trabajo']);
    exit();
}

$espacioId = $input['espacio_trabajo_id'];
$usuarioId = $usuario['id'];

// Verificar si el usuario es miembro del espacio de trabajo
$stmt = $conn->prepare("SELECT 1 FROM miembros_espacios_trabajo WHERE espacio_trabajo_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $espacioId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No perteneces a este espacio de trabajo']);
    exit();
}
$stmt->close();

// Eliminar al usuario de todos los mapas mentales del espacio
$stmt = $conn->prepare("
    DELETE FROM miembros_mapas_mentales 
    WHERE usuario_id = ? AND mapa_mental_id IN (
        SELECT id FROM mapas_mentales WHERE espacio_trabajo_id = ?
    )
");
$stmt->bind_param("si", $usuarioId, $espacioId);
$stmt->execute();
$stmt->close();

// Eliminar al usuario de todos los tableros Kanban del espacio
$stmt = $conn->prepare("
    DELETE FROM miembros_tableros 
    WHERE usuario_id = ? AND tablero_id IN (
        SELECT id FROM tableros WHERE espacio_trabajo_id = ?
    )
");
$stmt->bind_param("si", $usuarioId, $espacioId);
$stmt->execute();
$stmt->close();

// Eliminar invitaciones dirigidas a este usuario dentro del espacio de trabajo (por email)
$stmt = $conn->prepare("DELETE FROM invitaciones WHERE email = ? AND espacio_trabajo_id = ?");
$stmt->bind_param("si", $usuario['email'], $espacioId);
$stmt->execute();
$stmt->close();


// Finalmente, eliminar usuario del espacio de trabajo
$stmt = $conn->prepare("DELETE FROM miembros_espacios_trabajo WHERE espacio_trabajo_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $espacioId, $usuarioId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Saliste del espacio de trabajo exitosamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al salir del espacio de trabajo']);
}

$stmt->close();
$conn->close();
?>
