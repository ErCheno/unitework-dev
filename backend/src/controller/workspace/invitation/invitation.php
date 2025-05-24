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

if (
    !$input || 
    empty($input['email']) || 
    empty($input['espacio_trabajo_id']) || 
    empty($input['tipo']) || 
    !in_array($input['tipo'], ['kanban', 'mapa_mental']) ||
    empty($input['rol'])
) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros obligatorios o tipo/rol inválidos']);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    echo json_encode(['success' => false, 'message' => 'El email proporcionado no es válido']);
    exit;
}

$espacioTrabajoId = $input['espacio_trabajo_id'];
$tipo = $input['tipo'];
$rol = $input['rol'];
$estado = 'pendiente';
$rolEspacioTrabajo = 'miembro';  // Por defecto cuando se invita
$token = bin2hex(random_bytes(32));
$fechaExpiracion = date('Y-m-d H:i:s', strtotime('+7 days'));
$fechaEnvio = date('Y-m-d H:i:s');

$tableroId = null;
$mapaId = null;

// Validar e insertar según tipo
if ($tipo === 'kanban') {
    if (empty($input['tablero_id'])) {
        echo json_encode(['success' => false, 'message' => 'Falta tablero_id para invitación Kanban']);
        exit;
    }
    $tableroId = $input['tablero_id'];

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

    // Verificar permisos del usuario para invitar
    $stmt = $conn->prepare("
        SELECT met.rol AS rol_espacio_trabajo, mt.rol AS rol_tablero
        FROM miembros_espacios_trabajo met
        LEFT JOIN miembros_tableros mt ON met.usuario_id = mt.usuario_id AND mt.tablero_id = ?
        WHERE met.usuario_id = ? AND met.espacio_trabajo_id = ?
    ");
    $stmt->bind_param("iss", $tableroId, $userId, $espacioTrabajoId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "El usuario no tiene acceso al espacio de trabajo o tablero"]);
        exit;
    }
    $row = $result->fetch_assoc();
    if ($row['rol_espacio_trabajo'] !== 'admin' && $row['rol_tablero'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Permisos insuficientes para invitar a este tablero"]);
        exit;
    }
    $stmt->close();

    // Verificar si el usuario ya es miembro del tablero
    $stmt = $conn->prepare("
        SELECT mt.id 
        FROM miembros_tableros mt
        INNER JOIN usuarios u ON mt.usuario_id = u.id
        WHERE mt.tablero_id = ? AND u.email = ?
    ");
    $stmt->bind_param("is", $tableroId, $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "El usuario ya es miembro del tablero"]);
        exit;
    }
    $stmt->close();

    // Verificar invitación duplicada
    $stmt = $conn->prepare("
        SELECT id FROM invitaciones 
        WHERE email = ? AND espacio_trabajo_id = ? AND tablero_id = ? 
        AND estado IN ('pendiente', 'aceptada')
    ");
    $stmt->bind_param("sii", $email, $espacioTrabajoId, $tableroId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Ya existe una invitación pendiente o aceptada para este tablero"]);
        exit;
    }
    $stmt->close();

} else if ($tipo === 'mapa_mental') {
    if (empty($input['mapa_id'])) {
        echo json_encode(['success' => false, 'message' => 'Falta mapa_id para invitación mapa mental']);
        exit;
    }
    $mapaId = $input['mapa_id'];

    // Verificar si el mapa existe
    $stmt = $conn->prepare("SELECT id FROM mapas_mentales WHERE id = ?");
    $stmt->bind_param("i", $mapaId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "El mapa mental no existe"]);
        exit;
    }
    $stmt->close();

    // Verificar permisos del usuario para invitar
    $stmt = $conn->prepare("
        SELECT met.rol AS rol_espacio_trabajo, mm.rol AS rol_mapa
        FROM miembros_espacios_trabajo met
        LEFT JOIN miembros_mapas_mentales mm ON met.usuario_id = mm.usuario_id AND mm.mapa_mental_id = ?
        WHERE met.usuario_id = ? AND met.espacio_trabajo_id = ?
    ");
    $stmt->bind_param("iss", $mapaId, $userId, $espacioTrabajoId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "El usuario no tiene acceso al espacio de trabajo o mapa"]);
        exit;
    }
    $row = $result->fetch_assoc();
    if ($row['rol_espacio_trabajo'] !== 'admin' && $row['rol_mapa'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Permisos insuficientes para invitar a este mapa"]);
        exit;
    }
    $stmt->close();

    // Verificar si el usuario ya es miembro del mapa
    $stmt = $conn->prepare("
        SELECT mm.id 
        FROM miembros_mapas_mentales mm
        INNER JOIN usuarios u ON mm.usuario_id = u.id
        WHERE mm.mapa_mental_id = ? AND u.email = ?
    ");
    $stmt->bind_param("is", $mapaId, $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "El usuario ya es miembro del mapa mental"]);
        exit;
    }
    $stmt->close();

    // Verificar invitación duplicada
    $stmt = $conn->prepare("
        SELECT id FROM invitaciones 
        WHERE email = ? AND espacio_trabajo_id = ? AND mapa_id = ? 
        AND estado IN ('pendiente', 'aceptada')
    ");
    $stmt->bind_param("sii", $email, $espacioTrabajoId, $mapaId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Ya existe una invitación pendiente o aceptada para este mapa"]);
        exit;
    }
    $stmt->close();
}

// Registrar invitación en tabla con columna única "rol"
$stmt = $conn->prepare("
    INSERT INTO invitaciones (
        email, espacio_trabajo_id, tablero_id, mapa_id,
        rol,
        estado, token, fecha_envio, fecha_aceptacion, fecha_expiracion, remitente_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
");
$stmt->bind_param(
    "siisssssss",
    $email, $espacioTrabajoId, $tableroId, $mapaId,
    $rol,
    $estado, $token, $fechaEnvio, $fechaExpiracion, $userId
);

$executeSuccess = $stmt->execute();
$stmt->close();

if ($executeSuccess) {
    echo json_encode(["success" => true, "message" => "Invitación enviada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al guardar la invitación"]);
}

$conn->close();
?>
