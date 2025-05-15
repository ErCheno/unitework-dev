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

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

// Verificar token y usuario autenticado
$usuario = verificarToken($conn);
if (!$usuario) {
    echo json_encode(["success" => false, "message" => "Usuario no autenticado"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['tablero_id']) || empty($input['usuario_id']) || empty($input['nuevo_rol'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios: tablero_id, usuario_id, nuevo_rol']);
    exit();
}

$tablero_id = intval($input['tablero_id']);
$usuario_id = intval($input['usuario_id']);
$nuevo_rol = $conn->real_escape_string($input['nuevo_rol']);

if (!in_array($nuevo_rol, ['admin', 'miembro'])) {
    echo json_encode(['success' => false, 'message' => 'El rol proporcionado no es válido']);
    exit();
}

// Opcional: verificar que el usuario que intenta hacer el cambio sea admin del tablero
$stmt = $conn->prepare("SELECT rol FROM miembros_tableros WHERE tablero_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $tablero_id, $usuario['id']);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No tienes permisos en este tablero']);
    exit();
}
$rolActual = $result->fetch_assoc()['rol'];
$stmt->close();

if ($rolActual !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Solo un admin puede cambiar roles']);
    exit();
}

// Actualizar rol del usuario en el tablero
$stmt = $conn->prepare("UPDATE miembros_tableros SET rol = ? WHERE tablero_id = ? AND usuario_id = ?");
$stmt->bind_param("sis", $nuevo_rol, $tablero_id, $usuario_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Rol actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar el rol']);
}

$stmt->close();
$conn->close();
?>
