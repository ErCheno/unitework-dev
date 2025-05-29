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

if (empty($input['mindmapId'])) {
    echo json_encode(['success' => false, 'message' => 'El campo mindmapId es obligatorio']);
    exit;
}

$mindmapId = $input['mindmapId'];

// Verificar acceso del usuario al mapa mental
$stmt = $conn->prepare("
    SELECT m.*, 
           mm.rol AS rol_mapa,
           me.rol AS rol_espacio_trabajo
    FROM mapas_mentales m
    INNER JOIN miembros_mapas_mentales mm ON m.id = mm.mapa_mental_id AND mm.usuario_id = ?
    INNER JOIN miembros_espacios_trabajo me ON m.espacio_trabajo_id = me.espacio_trabajo_id AND me.usuario_id = ?
    WHERE m.id = ?
");
$stmt->bind_param("ssi", $usuarioId, $usuarioId, $mindmapId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes acceso o el mapa mental no existe"]);
    exit;
}

$row = $result->fetch_assoc();
$row['es_admin_mapa'] = ($row['rol_mapa'] === 'admin');
$row['es_admin_espacio'] = ($row['rol_espacio_trabajo'] === 'admin');
$row['fecha_creacion_relativa'] = tiempoPasado($row['fecha_creacion']);

// Obtener miembros del mapa mental
$miembrosStmt = $conn->prepare("
    SELECT u.id, u.nombre, u.email, mm.rol
    FROM usuarios u
    INNER JOIN miembros_mapas_mentales mm ON u.id = mm.usuario_id
    WHERE mm.mapa_mental_id = ?
");
$miembrosStmt->bind_param("i", $mindmapId);
$miembrosStmt->execute();
$miembrosResult = $miembrosStmt->get_result();

$miembros = [];
while ($miembro = $miembrosResult->fetch_assoc()) {
    $miembros[] = $miembro;
}
$row['miembros'] = $miembros;

$miembrosStmt->close();
$stmt->close();

// Función para calcular tiempo pasado
function tiempoPasado($tiempo)
{
    $tiempoPasado = strtotime($tiempo);
    $current_time = time();
    $time_difference = $current_time - $tiempoPasado;

    $segundos = $time_difference;
    $minutos = round($segundos / 60);
    $horas = round($segundos / 3600);
    $dias = round($segundos / 86400);
    $semanas = round($segundos / 604800);
    $meses = round($segundos / 2629440);
    $anyos = round($segundos / 31553280);

    if ($segundos <= 60) return "Hace $segundos segundos";
    if ($minutos <= 60) return ($minutos == 1) ? "Hace un minuto" : "Hace $minutos minutos";
    if ($horas <= 24) return ($horas == 1) ? "Hace una hora" : "Hace $horas horas";
    if ($dias <= 7) return ($dias == 1) ? "Ayer" : "Hace $dias días";
    if ($semanas <= 4.3) return ($semanas == 1) ? "Hace una semana" : "Hace $semanas semanas";
    if ($meses <= 12) return ($meses == 1) ? "Hace un mes" : "Hace $meses meses";
    return ($anyos == 1) ? "Hace un año" : "Hace $anyos años";
}

echo json_encode([
    "success" => true,
    "mindmap" => $row
]);

$conn->close();
?>
