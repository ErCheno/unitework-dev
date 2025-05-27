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
$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obligatorios
if (empty($input['mapa_id']) || !isset($input['contenido'])) {
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios"]);
    exit();
}

$mapaId = $input['mapa_id'];
$contenido = $input['contenido'];
$padreId = isset($input['padre_id']) ? $input['padre_id'] : null;
$orden = isset($input['orden']) ? $input['orden'] : 0;

// Verificar acceso al mapa mental
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

// Verificar que el padre exista y sea del mismo mapa (si se envía)
if ($padreId !== null) {
    $stmt = $conn->prepare("SELECT id FROM nodos_mapa WHERE id = ? AND mapa_id = ?");
    $stmt->bind_param("ii", $padreId, $mapaId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "El nodo padre no existe o no pertenece a este mapa"]);
        exit();
    }
    $stmt->close();
}

// Insertar nodo
$stmtInsert = $conn->prepare("
    INSERT INTO nodos_mapa (mapa_id, contenido, padre_id, orden)
    VALUES (?, ?, ?, ?)
");
$stmtInsert->bind_param("isii", $mapaId, $contenido, $padreId, $orden);

if ($stmtInsert->execute()) {
    $nuevoId = $stmtInsert->insert_id;

    // Actualizar fecha_modificacion del mapa
    $stmtFecha = $conn->prepare("UPDATE mapas_mentales SET fecha_modificacion = NOW() WHERE id = ?");
    if ($stmtFecha) {
        $stmtFecha->bind_param("i", $mapaId);
        $stmtFecha->execute();
        $stmtFecha->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Nodo creado correctamente",
        "nodo" => [
            "id" => $nuevoId,
            "mapa_id" => $mapaId,
            "contenido" => $contenido,
            "padre_id" => $padreId,
            "orden" => $orden
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear el nodo"]);
}

$stmtInsert->close();
$conn->close();
?>
