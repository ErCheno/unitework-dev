<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Leer mapa_id desde JSON body para POST
$input = json_decode(file_get_contents('php://input'), true);
$mapaId = isset($input['mapa_id']) ? intval($input['mapa_id']) : 0;

if ($mapaId === 0) {
    echo json_encode(["success" => false, "message" => "Falta mapa_id"]);
    exit();
}

// Verificar acceso al mapa mental
$stmt = $conn->prepare("
    SELECT mm.id
    FROM mapas_mentales mm
    INNER JOIN miembros_espacios_trabajo me ON mm.espacio_trabajo_id = me.espacio_trabajo_id
    WHERE mm.id = ? AND me.usuario_id = ?
");
$stmt->bind_param("ii", $mapaId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso a este mapa mental"]);
    exit();
}
$stmt->close();

// Obtener nodo raíz: nodo cuyo padre_id es NULL para este mapa
$stmt = $conn->prepare("SELECT id, contenido FROM nodos_mapa WHERE mapa_id = ? AND padre_id IS NULL LIMIT 1");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No se encontró nodo raíz"]);
    exit();
}

$nodoRaiz = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "nodoRaiz" => $nodoRaiz
]);

$stmt->close();
$conn->close();
?>
