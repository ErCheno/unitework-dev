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
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['espacio_trabajo_id'])) {
    echo json_encode(['success' => false, 'message' => 'El campo espacio_trabajo_id es obligatorio']);
    exit;
}

// Verificar que el usuario exista
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}
$stmt->close();

// Obtener tableros del espacio de trabajo
$stmt = $conn->prepare("
    SELECT t.*, 
           mt.rol AS rol_tablero,
           me.rol AS rol_espacio_trabajo
    FROM tableros t
    INNER JOIN miembros_tableros mt ON t.id = mt.tablero_id AND mt.usuario_id = ?
    INNER JOIN miembros_espacios_trabajo me ON t.espacio_trabajo_id = me.espacio_trabajo_id AND me.usuario_id = ?
    WHERE t.espacio_trabajo_id = ?
");
$stmt->bind_param("ssi", $usuarioId, $usuarioId, $input['espacio_trabajo_id']);
$stmt->execute();
$result = $stmt->get_result();

$tableros = [];
while ($row = $result->fetch_assoc()) {
    $tableroId = $row['id'];
    $row['es_admin_tablero'] = ($row['rol_tablero'] === 'admin');
    $row['es_admin_espacio'] = ($row['rol_espacio_trabajo'] === 'admin');
    $row['fecha_creacion_relativa'] = tiempoPasado($row['fecha_creacion']);

    // Obtener miembros del tablero actual
    $miembrosStmt = $conn->prepare("
        SELECT u.id, u.nombre, u.email, mt.rol
        FROM usuarios u
        INNER JOIN miembros_tableros mt ON u.id = mt.usuario_id
        WHERE mt.tablero_id = ?
    ");
    $miembrosStmt->bind_param("i", $tableroId);
    $miembrosStmt->execute();
    $miembrosResult = $miembrosStmt->get_result();

    $miembros = [];
    while ($miembro = $miembrosResult->fetch_assoc()) {
        $miembros[] = $miembro;
    }

    $row['miembros'] = $miembros;

    $miembrosStmt->close();
    $tableros[] = $row;
}

// Función para calcular el tiempo pasado
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
    "tableros" => $tableros
]);

$stmt->close();
$conn->close();
?>
