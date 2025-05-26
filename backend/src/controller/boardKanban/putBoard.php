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
    http_response_code(405);
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

// Validar campos mínimos
if (empty($input['tablero_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID del tablero no proporcionado']);
    exit();
}

$tableroId = $input['tablero_id'];
$nuevoNombre = isset($input['nombre']) ? trim($input['nombre']) : null;
$nuevaDescripcion = isset($input['descripcion']) ? trim($input['descripcion']) : null;

if ($nuevoNombre === null && $nuevaDescripcion === null) {
    echo json_encode(['success' => false, 'message' => 'No se proporcionó ningún campo a actualizar']);
    exit();
}

// Verificar si el usuario es admin del tablero
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

// Construir la consulta UPDATE dinámicamente
$campos = [];
$valores = [];
$tipos = '';

if ($nuevoNombre !== null) {
    $campos[] = 'nombre = ?';
    $valores[] = $nuevoNombre;
    $tipos .= 's';
}
if ($nuevaDescripcion !== null) {
    $campos[] = 'descripcion = ?';
    $valores[] = $nuevaDescripcion;
    $tipos .= 's';
}

// Agregar actualización de la fecha de última actividad
$campos[] = 'ultima_actividad = NOW()';

$valores[] = $tableroId;
$tipos .= 'i';

$sql = "UPDATE tableros SET " . implode(", ", $campos) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Tablero actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar el tablero']);
}

$stmt->close();
$conn->close();
?>
