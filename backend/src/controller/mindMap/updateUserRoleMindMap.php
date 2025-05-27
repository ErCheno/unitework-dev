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
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Usa PUT.']);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
if (!$usuario) {
    echo json_encode(["success" => false, "message" => "Usuario no autenticado"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['mapa_id']) || empty($input['usuario_id']) || empty($input['nuevo_rol'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios: mapa_id, usuario_id, nuevo_rol']);
    exit();
}

$mapa_id = (int)$input['mapa_id'];
$usuario_id = (int)$input['usuario_id'];
$nuevo_rol = $input['nuevo_rol'];

if (!in_array($nuevo_rol, ['admin', 'miembro'])) {
    echo json_encode(['success' => false, 'message' => 'El rol proporcionado no es válido']);
    exit();
}

// Verificar que el usuario autenticado sea admin del mapa mental
$stmt = $conn->prepare("SELECT rol FROM miembros_mapas_mentales WHERE mapa_mental_id = ? AND usuario_id = ?");
$stmt->bind_param("ii", $mapa_id, $usuario['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'No tienes permisos en este mapa mental']);
    exit();
}

$rolActual = $result->fetch_assoc()['rol'];
$stmt->close();

if ($rolActual !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Solo un admin puede cambiar roles']);
    exit();
}

// Actualizar el rol del usuario en el mapa
$stmt = $conn->prepare("UPDATE miembros_mapas_mentales SET rol = ? WHERE mapa_mental_id = ? AND usuario_id = ?");
$stmt->bind_param("sii", $nuevo_rol, $mapa_id, $usuario_id);

if ($stmt->execute()) {
    $stmt->close();

    // Actualizar fecha_modificacion del mapa solo si update del rol fue exitoso
    $stmtFecha = $conn->prepare("UPDATE mapas_mentales SET fecha_modificacion = NOW() WHERE id = ?");
    if ($stmtFecha) {
        $stmtFecha->bind_param("i", $mapa_id);
        $stmtFecha->execute();
        $stmtFecha->close();
    }

    echo json_encode(['success' => true, 'message' => 'Rol actualizado correctamente']);
} else {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'Error al actualizar el rol']);
}

$conn->close();
