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

if (empty($input['mapa_id'])) {
    echo json_encode(["success" => false, "message" => "El campo mapa_id es obligatorio"]);
    exit();
}

$mapaId = intval($input['mapa_id']);
$nuevoTitulo = isset($input['titulo']) ? trim($input['titulo']) : null;
$nuevaDescripcion = isset($input['descripcion']) ? trim($input['descripcion']) : null;

// Verificar que el mapa mental existe y pertenece a un espacio de trabajo al que el usuario tiene acceso
$stmt = $conn->prepare("
    SELECT mm.espacio_trabajo_id, me.rol AS rol_espacio_trabajo
    FROM mapas_mentales mm
    INNER JOIN miembros_espacios_trabajo me ON mm.espacio_trabajo_id = me.espacio_trabajo_id AND me.usuario_id = ?
    WHERE mm.id = ?
");
$stmt->bind_param("si", $usuarioId, $mapaId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Mapa mental no encontrado o sin permisos"]);
    exit();
}

$row = $result->fetch_assoc();
$rolEspacio = $row['rol_espacio_trabajo'];
$stmt->close();

// Solo permitir actualización si es admin del espacio de trabajo
if ($rolEspacio !== 'admin') {
    echo json_encode(["success" => false, "message" => "No tienes permisos para modificar este mapa mental"]);
    exit();
}

// Construir query dinámico para actualizar solo los campos que se enviaron
$camposActualizar = [];
$parametros = [];
$tipos = '';

if ($nuevoTitulo !== null) {
    $camposActualizar[] = "titulo = ?";
    $parametros[] = $nuevoTitulo;
    $tipos .= 's';
}
if ($nuevaDescripcion !== null) {
    $camposActualizar[] = "descripcion = ?";
    $parametros[] = $nuevaDescripcion;
    $tipos .= 's';
}

if (count($camposActualizar) === 0) {
    echo json_encode(["success" => false, "message" => "No se enviaron campos para actualizar"]);
    exit();
}

$sql = "UPDATE mapas_mentales SET " . implode(", ", $camposActualizar) . " WHERE id = ?";
$parametros[] = $mapaId;
$tipos .= 'i';

$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$parametros);

// Actualizar fecha_modificacion del mapa
$stmtFecha = $conn->prepare("UPDATE mapas_mentales SET fecha_modificacion = NOW() WHERE id = ?");
if ($stmtFecha) {
    $stmtFecha->bind_param("i", $mapaId);
    $stmtFecha->execute();
    $stmtFecha->close();
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Mapa mental actualizado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar el mapa mental"]);
}

$stmt->close();
$conn->close();
