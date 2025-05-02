<?php

require_once __DIR__ . '/../../../config/db.php';
require_once "../../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$usuario = verificarToken($conn);
$userId = $usuario['id'];

// Validar los parámetros
if (!$input || empty($input['email']) || empty($input['espacio_trabajo_id']) || empty($input['tablero_id']) || empty($input['rol_tablero'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros obligatorios']);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);  // Validación básica de email
if (!$email) {
    echo json_encode(['success' => false, 'message' => 'El email proporcionado no es válido']);
    exit;
}

$espacioTrabajoId = $input['espacio_trabajo_id'];
$tableroId = $input['tablero_id'];
$rolTablero = $input['rol_tablero'];

// Verificar que el usuario existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}
$stmt->close();

// Verificar si el espacio de trabajo existe
$stmt = $conn->prepare("SELECT id FROM espacios_trabajo WHERE id = ?");
$stmt->bind_param("i", $espacioTrabajoId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El espacio de trabajo no existe"]);
    exit;
}
$stmt->close();

// Verificar si el tablero existe
$stmt = $conn->prepare("SELECT id FROM tableros WHERE id = ?");
$stmt->bind_param("i", $tableroId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El tablero no existe"]);
    exit;
}
$stmt->close();

// Verificar permisos del usuario que invita
$stmt = $conn->prepare("
    SELECT 
        met.rol AS rol_espacio_trabajo, 
        mt.rol AS rol_tablero
    FROM 
        miembros_espacios_trabajo met
    INNER JOIN 
        miembros_tableros mt 
    ON 
        met.usuario_id = mt.usuario_id
    WHERE 
        met.usuario_id = ? AND met.espacio_trabajo_id = ? AND mt.tablero_id = ?
");
$stmt->bind_param("sii", $userId, $espacioTrabajoId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no tiene acceso a este espacio de trabajo o tablero"]);
    exit;
}
$row = $result->fetch_assoc();
$rolUsuarioEspacioTrabajo = $row['rol_espacio_trabajo'];
$rolUsuarioTablero = $row['rol_tablero'];
$stmt->close();

if ($rolUsuarioEspacioTrabajo !== 'admin' && $rolUsuarioTablero !== 'admin') {
    echo json_encode(["success" => false, "message" => "El usuario no tiene permisos para enviar invitaciones"]);
    exit;
}

// 🧠 Verificar si el usuario invitado YA ES MIEMBRO del tablero
$stmt = $conn->prepare("
    SELECT mt.id 
    FROM miembros_tableros mt
    INNER JOIN usuarios u ON mt.usuario_id = u.id
    WHERE mt.tablero_id = ? AND u.email = ?
");
$stmt->bind_param("is", $tableroId, $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El usuario ya es miembro de este tablero"]);
    exit;
}
$stmt->close();

// Verificar invitación pendiente o aceptada
$stmt = $conn->prepare("SELECT id FROM invitaciones WHERE email = ? AND espacio_trabajo_id = ? AND tablero_id = ? AND estado IN ('pendiente', 'aceptada')");
$stmt->bind_param("sii", $email, $espacioTrabajoId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Ya existe una invitación pendiente o aceptada para este usuario"]);
    exit;
}
$stmt->close();

// Crear invitación
$token = bin2hex(random_bytes(32));
$fechaExpiracion = date('Y-m-d H:i:s', strtotime('+7 days'));
$estado = 'pendiente';
$rolEspacioTrabajo = 'miembro';

$stmt = $conn->prepare("
    INSERT INTO invitaciones (
        email, espacio_trabajo_id, tablero_id, 
        rol_espacio_trabajo, rol_tablero, 
        estado, token, fecha_envio, fecha_aceptacion, fecha_expiracion, remitente_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NULL, ?, ?)
");
$stmt->bind_param("siissssss", $email, $espacioTrabajoId, $tableroId, $rolEspacioTrabajo, $rolTablero, $estado, $token, $fechaExpiracion, $userId);

$executeSuccess = $stmt->execute();
$stmt->close();

if ($executeSuccess) {
    echo json_encode(["success" => true, "message" => "Invitación registrada correctamente", "token" => $token]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar la invitación"]);
}

$conn->close();
?>
