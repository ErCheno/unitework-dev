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

if (!$input || empty($input['email']) || empty($input['espacio_trabajo_id']) || empty($input['mapa_id']) || empty($input['rol_mapa'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros obligatorios']);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    echo json_encode(['success' => false, 'message' => 'El email proporcionado no es válido']);
    exit;
}

$espacioTrabajoId = $input['espacio_trabajo_id'];
$mapaId = $input['mapa_id'];
$rolMapa = $input['rol_mapa'];

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

// Verificar si el mapa mental existe
$stmt = $conn->prepare("SELECT id FROM mapas_mentales WHERE id = ?");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El mapa mental no existe"]);
    exit;
}
$stmt->close();

// Verificar permisos del usuario que invita
$stmt = $conn->prepare("
    SELECT 
        met.rol AS rol_espacio_trabajo, 
        mm.rol AS rol_mapa
    FROM 
        miembros_espacios_trabajo met
    INNER JOIN 
        miembros_mapas mm 
    ON 
        met.usuario_id = mm.usuario_id
    WHERE 
        met.usuario_id = ? AND met.espacio_trabajo_id = ? AND mm.mapa_id = ?
");
$stmt->bind_param("sii", $userId, $espacioTrabajoId, $mapaId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso a este espacio de trabajo o mapa mental"]);
    exit;
}
$row = $result->fetch_assoc();
$rolUsuarioEspacioTrabajo = $row['rol_espacio_trabajo'];
$rolUsuarioMapa = $row['rol_mapa'];
$stmt->close();

if ($rolUsuarioEspacioTrabajo !== 'admin' && $rolUsuarioMapa !== 'admin') {
    echo json_encode(["success" => false, "message" => "No tienes permisos para enviar invitaciones"]);
    exit;
}

// Verificar si el usuario ya es miembro del mapa
$stmt = $conn->prepare("
    SELECT mm.id 
    FROM miembros_mapas mm
    INNER JOIN usuarios u ON mm.usuario_id = u.id
    WHERE mm.mapa_id = ? AND u.email = ?
");
$stmt->bind_param("is", $mapaId, $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El usuario ya es miembro de este mapa mental"]);
    exit;
}
$stmt->close();

// Verificar invitación existente
$stmt = $conn->prepare("SELECT id FROM invitaciones WHERE email = ? AND espacio_trabajo_id = ? AND mapa_id = ? AND estado IN ('pendiente', 'aceptada')");
$stmt->bind_param("sii", $email, $espacioTrabajoId, $mapaId);
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
        email, espacio_trabajo_id, mapa_id, 
        rol_espacio_trabajo, rol_mapa, 
        estado, token, fecha_envio, fecha_aceptacion, fecha_expiracion, remitente_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NULL, ?, ?)
");
$stmt->bind_param("siissssss", $email, $espacioTrabajoId, $mapaId, $rolEspacioTrabajo, $rolMapa, $estado, $token, $fechaExpiracion, $userId);

$executeSuccess = $stmt->execute();
$stmt->close();

if ($executeSuccess) {
    echo json_encode(["success" => true, "message" => "Invitación al mapa mental enviada correctamente", "token" => $token]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar la invitación"]);
}

$conn->close();
?>
