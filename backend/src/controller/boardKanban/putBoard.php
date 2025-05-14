<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405); // Método no permitido
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents('php://input'), true);

// Validaciones mínimas
if (empty($input['tablero_id']) || empty($input['nombre'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios']);
    exit();
}

$tableroId = $input['tablero_id'];
$nuevoNombre = trim($input['nombre']);

// Verificar si el usuario es administrador del tablero
$stmt = $conn->prepare("
    SELECT rol 
    FROM miembros_tableros 
    WHERE tablero_id = ? AND usuario_id = ?
");
$stmt->bind_param("is", $tableroId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No perteneces a este tablero']);
    exit();
}

$fila = $result->fetch_assoc();
if ($fila['rol'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'No tienes permiso para editar este tablero']);
    exit();
}
$stmt->close();

// Actualizar el nombre del tablero
$stmt = $conn->prepare("UPDATE tableros SET nombre = ? WHERE id = ?");
$stmt->bind_param("si", $nuevoNombre, $tableroId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Tablero actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar el tablero']);
}

$stmt->close();
$conn->close();
?>
