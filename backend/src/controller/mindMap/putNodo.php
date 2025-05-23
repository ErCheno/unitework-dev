<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

// Obtener datos JSON enviados
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['nodo_id']) || empty($input['contenido'])) {
    echo json_encode(["success" => false, "message" => "Faltan parámetros obligatorios"]);
    exit();
}

$nodoId = intval($input['nodo_id']);
$nuevoContenido = $input['contenido'];

// Verificar que el nodo existe y obtener mapa_id para validar permisos
$stmt = $conn->prepare("SELECT mapa_id FROM nodos_mapa WHERE id = ?");
$stmt->bind_param("i", $nodoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Nodo no encontrado"]);
    exit();
}

$row = $result->fetch_assoc();
$mapaId = $row['mapa_id'];
$stmt->close();

// Verificar que el usuario tiene acceso al mapa
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
    echo json_encode(["success" => false, "message" => "No tienes permiso para modificar este nodo"]);
    exit();
}
$stmt->close();

// Actualizar contenido del nodo
$stmt = $conn->prepare("UPDATE nodos_mapa SET contenido = ? WHERE id = ?");
$stmt->bind_param("si", $nuevoContenido, $nodoId);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Nodo actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar el nodo"]);
}
$stmt->close();
$conn->close();
