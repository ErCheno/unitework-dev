<?php
require_once "../../config/db.php";
require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificación del token para obtener el usuario_id
$usuarioId = verificarToken($conn);

$input = json_decode(file_get_contents("php://input"), true);

if (
    !$input ||
    !isset($input['id']) ||
    (!isset($input['nombre']) && !isset($input['descripcion']))
) {
    echo json_encode(["success" => false, "message" => "Datos incompletos", "debug" => $input]);
    exit();
}

file_put_contents("debug.json", json_encode($input, JSON_PRETTY_PRINT));

$espacioTrabajoId = $input['id'];
$nombre = $input['nombre'] ?? null;
$descripcion = $input['descripcion'] ?? null;

// Validar si el usuario es administrador del espacio
$stmt = $conn->prepare("SELECT rol FROM miembros_espacios_trabajo WHERE usuario_id = ? AND espacio_trabajo_id = ?");
$stmt->bind_param("si", $usuarioId, $espacioTrabajoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este espacio"]);
    exit();
}

$row = $result->fetch_assoc();
if ($row['rol'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Solo un administrador puede modificar este espacio"]);
    exit();
}

// Construir consulta dinámica
$campos = [];
$parametros = [];
$tipos = "";

if ($nombre !== null) {
    $campos[] = "nombre = ?";
    $parametros[] = $nombre;
    $tipos .= "s";
}
if ($descripcion !== null) {
    $campos[] = "descripcion = ?";
    $parametros[] = $descripcion;
    $tipos .= "s";
}

$parametros[] = $espacioTrabajoId;
$tipos .= "i";

$sql = "UPDATE espacios_trabajo SET " . implode(", ", $campos) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$parametros);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "Espacio actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();

function verificarToken($conn) {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        throw new Exception("Token no proporcionado");
    }

    if (!preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        throw new Exception("Formato de token inválido");
    }

    $token = $matches[1];

    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE token = ? AND token_expira > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Token inválido o expirado");
    }

    $usuario = $result->fetch_assoc();
    return $usuario['id']; // Devuelve el ID del usuario autenticado
}
?>
