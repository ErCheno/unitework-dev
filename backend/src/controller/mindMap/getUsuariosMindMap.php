<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

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

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['mindmapId'])) {
    echo json_encode(['success' => false, 'message' => 'El campo mindmapId es obligatorio']);
    exit;
}

$mindmapId = $input['mindmapId'];

// Verificar si el usuario tiene acceso al mapa mental
$accesoStmt = $conn->prepare("
    SELECT 1
    FROM miembros_mapas_mentales
    WHERE mapa_id = ? AND usuario_id = ?
");
$accesoStmt->bind_param("ii", $mindmapId, $usuarioId);
$accesoStmt->execute();
$accesoStmt->store_result();

if ($accesoStmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes permiso para ver los miembros de este mapa"]);
    exit;
}
$accesoStmt->close();

// Obtener miembros del mapa mental
$stmt = $conn->prepare("
    SELECT u.id, u.nombre, u.email, mm.rol
    FROM usuarios u
    INNER JOIN miembros_mapas_mentales mm ON u.id = mm.usuario_id
    WHERE mm.mapa_id = ?
");
$stmt->bind_param("i", $mindmapId);
$stmt->execute();
$result = $stmt->get_result();

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $usuarios[] = $row;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "usuarios" => $usuarios
]);

$conn->close();
?>
