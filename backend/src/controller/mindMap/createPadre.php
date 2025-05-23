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
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
if (!$usuario) {
    echo json_encode(["success" => false, "message" => "Token inválido o expirado"]);
    exit();
}

$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['mapa_id']) || empty($input['topic']) || empty($input['hijo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios: mapa_id, topic, hijo_id']);
    exit();
}

$mapaId = (int)$input['mapa_id'];
$topic = trim($input['topic']);
$hijoId = (int)$input['hijo_id'];

// Verificar que el usuario tiene acceso al mapa mental
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
    exit;
}
$stmt->close();

// Insertar nuevo nodo padre (sin padre_id, o padre_id = NULL)
$stmt = $conn->prepare("INSERT INTO nodos_mapa (mapa_id, contenido, padre_id, orden) VALUES (?, ?, NULL, 0)");
$stmt->bind_param("is", $mapaId, $topic);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error al crear el nodo padre"]);
    exit();
}
$nuevoPadreId = $stmt->insert_id;
$stmt->close();

// Actualizar el nodo hijo para que apunte al nuevo nodo padre
$stmt = $conn->prepare("UPDATE nodos_mapa SET padre_id = ? WHERE id = ? AND mapa_id = ?");
$stmt->bind_param("iii", $nuevoPadreId, $hijoId, $mapaId);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error al actualizar el nodo hijo"]);
    exit();
}
$stmt->close();

// Obtener el nodo padre creado para devolverlo
$stmt = $conn->prepare("SELECT id, contenido, padre_id, orden FROM nodos_mapa WHERE id = ?");
$stmt->bind_param("i", $nuevoPadreId);
$stmt->execute();
$result = $stmt->get_result();
$nodoPadre = $result->fetch_assoc();
$stmt->close();

$conn->close();

echo json_encode([
    "success" => true,
    "nodo" => $nodoPadre
]);
