<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
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

if (empty($input['mapa_mental_id'])) {
    echo json_encode(['success' => false, 'message' => 'El campo mapa_mental_id es obligatorio']);
    exit;
}

$mapaId = $input['mapa_mental_id'];

// Verificar si el usuario es admin del mapa o del espacio de trabajo
$stmt = $conn->prepare("
    SELECT mm.id, mmm.rol AS rol_mapa, me.rol AS rol_espacio
    FROM mapas_mentales mm
    LEFT JOIN miembros_mapas_mentales mmm ON mm.id = mmm.mapa_mental_id AND mmm.usuario_id = ?
    INNER JOIN miembros_espacios_trabajo me ON mm.espacio_trabajo_id = me.espacio_trabajo_id AND me.usuario_id = ?
    WHERE mm.id = ?
");
$stmt->bind_param("ssi", $usuarioId, $usuarioId, $mapaId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes permisos para eliminar este mapa mental o no existe"]);
    exit;
}

$datos = $result->fetch_assoc();
$esAdminMapa = $datos['rol_mapa'] === 'admin';
$esAdminEspacio = $datos['rol_espacio'] === 'admin';

if (!$esAdminMapa && !$esAdminEspacio) {
    echo json_encode(["success" => false, "message" => "No tienes permisos de administrador para eliminar este mapa mental"]);
    exit;
}
$stmt->close();
/*
// Eliminar relaciones con miembros
$stmt = $conn->prepare("DELETE FROM miembros_mapas_mentales WHERE mapa_mental_id = ?");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$stmt->close();

// Eliminar nodos (si existen en tu modelo de datos)
$stmt = $conn->prepare("DELETE FROM nodos_mentales WHERE mapa_mental_id = ?");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$stmt->close();
*/
// Eliminar el mapa mental
$stmt = $conn->prepare("DELETE FROM mapas_mentales WHERE id = ?");
$stmt->bind_param("i", $mapaId);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Mapa mental eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar el mapa mental"]);
}
$stmt->close();
$conn->close();
?>
