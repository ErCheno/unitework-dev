<?php
require_once "../../config/db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['tablero_id']) || empty($input['usuario_id'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit();
}

$tableroId = $input['tablero_id'];
$usuarioId = $input['usuario_id'];

// Obtener el espacio de trabajo al que pertenece el tablero
$stmt = $conn->prepare("SELECT espacio_trabajo_id FROM tableros WHERE id = ?");
$stmt->bind_param("i", $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El tablero no existe"]);
    exit();
}

$row = $result->fetch_assoc();
$espacioTrabajoId = $row['espacio_trabajo_id'];

// Verificar si el usuario es admin de ese tablero
$stmt = $conn->prepare("SELECT rol FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmt->bind_param("si", $usuarioId, $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este tablero"]);
    exit();
}

$row = $result->fetch_assoc();
if ($row['rol'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Solo un administrador puede eliminar este tablero"]);
    exit();
}

// Eliminar el tablero (puedes eliminar también sus tareas o relaciones si lo necesitas)
$stmt = $conn->prepare("DELETE FROM tableros WHERE id = ?");
$stmt->bind_param("i", $tableroId);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "Tablero eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar el tablero"]);
}

$stmt->close();
$conn->close();
?>
