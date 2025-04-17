<?php
require_once "../../config/db.php"; 

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Manejo de la solicitud OPTIONS (preflight)
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit();
}

// Obtener los datos enviados en JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar que venga el campo creado_por (usuarioId)
if (!$input || empty($input['creado_por'])) {
    echo json_encode(['success' => false, 'message' => 'El campo creado_por (usuarioId) es obligatorio']);
    exit;
}

$userId = $input['creado_por'];

// Verificar que el usuario exista
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}
$stmt->close();

// Ahora sí, seleccionamos los espacios de trabajo creados por ese usuario
$stmt = $conn->prepare("SELECT id, nombre, descripcion, creado_por FROM espacios_trabajo WHERE creado_por = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

$workspaces = [];
while ($row = $result->fetch_assoc()) {
    $workspaces[] = $row;
}

echo json_encode([
    "success" => true,
    "workspaces" => $workspaces
]);

$stmt->close();
$conn->close();
?>
