<?php
require_once __DIR__ . '/../../../config/db.php';

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

if (!$input || empty($input['creado_por']) || empty($input['email']) || empty($input['espacio_trabajo_id']) || empty($input['tablero_id']) || empty($input['rol_espacio_trabajo']) || empty($input['rol_tablero'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros obligatorios']);
    exit;
}

$userId = $input['creado_por'];
$email = $input['email'];
$espacioTrabajoId = $input['espacio_trabajo_id'];
$tableroId = $input['tablero_id'];
$rolEspacioTrabajo = $input['rol_espacio_trabajo'];
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

// Verificar si el espacio de trabajo y tablero existen
$stmt = $conn->prepare("SELECT id FROM espacios_trabajo WHERE id = ?");
$stmt->bind_param("i", $espacioTrabajoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El espacio de trabajo no existe"]);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("SELECT id FROM tableros WHERE id = ?");
$stmt->bind_param("i", $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El tablero no existe"]);
    exit;
}
$stmt->close();

// Generar un token único para la invitación
$token = bin2hex(random_bytes(32));

// Insertar la invitación en la base de datos
$stmt = $conn->prepare("INSERT INTO invitaciones (email, espacio_trabajo_id, tablero_id, rol_espacio_trabajo, rol_tablero, estado, token, fecha_envio) VALUES (?, ?, ?, ?, ?, 'pendiente', ?, NOW())");
$stmt->bind_param("siiiss", $email, $espacioTrabajoId, $tableroId, $rolEspacioTrabajo, $rolTablero, $token);
$executeSuccess = $stmt->execute();
$stmt->close();

if ($executeSuccess) {
    // Aquí puedes enviar el token por correo o hacer lo que necesites con él
    echo json_encode(["success" => true, "message" => "Invitación enviada correctamente", "token" => $token]);
} else {
    echo json_encode(["success" => false, "message" => "Error al enviar la invitación"]);
}

$conn->close();

?>
