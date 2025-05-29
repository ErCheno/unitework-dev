<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error conexión DB"]);
    exit();
}

$usuario = verificarToken($conn);
if (!$usuario) {
    echo json_encode(["success" => false, "message" => "Token inválido"]);
    exit();
}
$usuarioId = $usuario['id'];

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nodos']) || !is_array($input['nodos'])) {
    echo json_encode(["success" => false, "message" => "Falta lista de nodos"]);
    exit();
}

$errores = [];
foreach ($input['nodos'] as $nodo) {
    $nodoId = intval($nodo['nodo_id']);
    $nuevoPadreIdRaw = $nodo['nuevo_padre_id'] ?? null;

    // Validar que el nodo existe y obtener mapa_id
    $stmt = $conn->prepare("SELECT mapa_id FROM nodos_mapa WHERE id = ?");
    $stmt->bind_param("i", $nodoId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $errores[] = "Nodo $nodoId no encontrado";
        continue;
    }
    $mapaId = $result->fetch_assoc()['mapa_id'];
    $stmt->close();

    // Verificar permisos del usuario en ese mapa
    $stmt = $conn->prepare("
        SELECT mm.id FROM mapas_mentales mm
        INNER JOIN miembros_espacios_trabajo me ON mm.espacio_trabajo_id = me.espacio_trabajo_id
        WHERE mm.id = ? AND me.usuario_id = ?
    ");
    $stmt->bind_param("ii", $mapaId, $usuarioId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $errores[] = "Sin permiso para modificar nodo $nodoId";
        continue;
    }
    $stmt->close();

    if ($nuevoPadreIdRaw === null || $nuevoPadreIdRaw === '') {
        $stmt = $conn->prepare("UPDATE nodos_mapa SET padre_id = NULL WHERE id = ?");
        $stmt->bind_param("i", $nodoId);
    } else {
        $nuevoPadreId = intval($nuevoPadreIdRaw);
        $stmt = $conn->prepare("UPDATE nodos_mapa SET padre_id = ? WHERE id = ?");
        $stmt->bind_param("ii", $nuevoPadreId, $nodoId);
    }

    if (!$stmt->execute()) {
        $errores[] = "Error actualizando nodo $nodoId: " . $stmt->error;
    }
    $stmt->close();
}

if (!isset($mapaId)) {
    echo json_encode(["success" => false, "message" => "No se pudo determinar el mapa para actualizar"]);
    exit();
}

// Actualizar fecha_modificacion del mapa
$stmtFecha = $conn->prepare("UPDATE mapas_mentales SET fecha_modificacion = NOW() WHERE id = ?");
if ($stmtFecha) {
    $stmtFecha->bind_param("i", $mapaId);
    $stmtFecha->execute();
    $stmtFecha->close();
}
$conn->close();

if (count($errores) > 0) {
    echo json_encode(["success" => false, "message" => "Errores en algunos nodos", "errores" => $errores]);
} else {
    echo json_encode(["success" => true, "message" => "Nodos actualizados correctamente"]);
}
