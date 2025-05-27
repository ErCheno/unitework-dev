<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
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
$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents("php://input"), true);

$nodoId = $input['nodo_id'] ?? null;

if (!$nodoId) {
    echo json_encode(["success" => false, "message" => "El ID del nodo es obligatorio"]);
    exit();
}

// Obtener el mapa_id del nodo
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
    exit();
}
$stmt->close();

// Función para eliminar nodos recursivamente
function eliminarNodoYSubnodos($conn, $nodoId) {
    // Obtener nodos hijos
    $stmt = $conn->prepare("SELECT id FROM nodos_mapa WHERE padre_id = ?");
    $stmt->bind_param("i", $nodoId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        eliminarNodoYSubnodos($conn, $row['id']);
    }
    $stmt->close();

    // Eliminar nodo actual
    $stmt = $conn->prepare("DELETE FROM nodos_mapa WHERE id = ?");
    $stmt->bind_param("i", $nodoId);
    $stmt->execute();
    $stmt->close();
}

// Ejecutar la eliminación
eliminarNodoYSubnodos($conn, $nodoId);

    // Actualizar fecha_modificacion del mapa
    $stmtFecha = $conn->prepare("UPDATE mapas_mentales SET fecha_modificacion = NOW() WHERE id = ?");
    if ($stmtFecha) {
        $stmtFecha->bind_param("i", $mapaId);
        $stmtFecha->execute();
        $stmtFecha->close();
    }

echo json_encode(["success" => true, "message" => "Nodo y subnodos eliminados correctamente"]);

$conn->close();
