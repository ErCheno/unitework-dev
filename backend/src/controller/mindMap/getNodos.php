<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

if (empty($input['mapa_id'])) {
    echo json_encode(['success' => false, 'message' => 'El campo mapa_id es obligatorio']);
    exit;
}

$mapaId = $input['mapa_id'];

// Verificar que el usuario tiene acceso al mapa mental
$stmt = $conn->prepare("
    SELECT mm.id
    FROM mapas_mentales mm
    INNER JOIN miembros_espacios_trabajo me ON mm.espacio_trabajo_id = me.espacio_trabajo_id
    WHERE mm.id = ? AND me.usuario_id = ?
");
$stmt->bind_param("is", $mapaId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso a este mapa mental"]);
    exit;
}
$stmt->close();

// Obtener nodos del mapa mental
$stmt = $conn->prepare("SELECT id, contenido, padre_id, orden FROM nodos_mapa WHERE mapa_id = ? ORDER BY orden ASC");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$result = $stmt->get_result();

$nodos = [];
while ($row = $result->fetch_assoc()) {
    $nodos[] = $row;
}

echo json_encode([
    "success" => true,
    "nodos_mapa" => $nodos
]);

$stmt->close();
$conn->close();
?>
