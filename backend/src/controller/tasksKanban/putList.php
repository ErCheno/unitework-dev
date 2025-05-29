<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['id'])) {
    echo json_encode(["success" => false, "message" => "Falta el ID de la lista (estado)"]);
    exit();
}

$estadoId = $input['id'];

// Verifica token
$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Obtener el tablero asociado a esta lista
$stmt = $conn->prepare("SELECT tablero_id FROM estados_tareas WHERE id = ?");
$stmt->bind_param("i", $estadoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "La lista no existe"]);
    exit();
}

$tableroId = $result->fetch_assoc()['tablero_id'];
$stmt->close();

// Verificar que el usuario pertenece al tablero
$stmt = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuarioId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso a este tablero"]);
    exit();
}
$stmt->close();

// Campos a actualizar
$campos = [];
$valores = [];

if (isset($input['nombre'])) {
    $campos[] = "nombre = ?";
    $valores[] = $input['nombre'];
}
if (isset($input['color'])) {
    $campos[] = "color = ?";
    $valores[] = $input['color'];
}

if (empty($campos)) {
    echo json_encode(["success" => false, "message" => "No hay campos para actualizar"]);
    exit();
}

// Preparar query dinámicamente
$sql = "UPDATE estados_tareas SET " . implode(", ", $campos) . " WHERE id = ?";
$valores[] = $estadoId;

$tipos = str_repeat("s", count($valores) - 1) . "i"; // los últimos siempre es id (int)
$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$valores);

$sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
$stmtUpdate = $conn->prepare($sqlUpdateActividad);
if ($stmtUpdate) {
    $stmtUpdate->bind_param("i", $tableroId);
    $stmtUpdate->execute();
    $stmtUpdate->close();
    // No hace falta manejar errores aquí a menos que quieras mostrar un warning
}


if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Lista actualizada correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}

$stmt->close();
$conn->close();
