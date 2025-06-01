<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['tablero_id'])) {
    echo json_encode(["success" => false, "message" => "Falta el ID del tablero"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];
$tableroId = $input['tablero_id'];

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

// Obtener las listas (estados) con su respectivo posicionamiento y ordenadas por posicionamiento
$stmt = $conn->prepare("
    SELECT id, nombre, creado_por, tablero_id, posicionamiento, color
    FROM estados_tareas 
    WHERE tablero_id = ? 
    ORDER BY posicionamiento ASC
");
$stmt->bind_param("i", $tableroId);
$stmt->execute();
$result = $stmt->get_result();

$listas = [];
while ($row = $result->fetch_assoc()) {
    $listas[] = $row;
}

echo json_encode([
    "success" => true,
    "listas" => $listas
]);

$stmt->close();
$conn->close();
