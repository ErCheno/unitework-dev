<?php
require_once "../../config/db.php";

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

// Obtener parámetros de la URL
$espacioTrabajoId = isset($_GET['espacio_trabajo_id']) ? $_GET['espacio_trabajo_id'] : null;
$usuarioId = isset($_GET['creado_por']) ? $_GET['creado_por'] : null;

if (empty($usuarioId)) {
    echo json_encode(['success' => false, 'message' => 'El campo creado_por (usuarioId) es obligatorio']);
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

// Obtener los tableros creados por el usuario
$stmt = $conn->prepare("SELECT * FROM tableros WHERE creado_por = ?");
$stmt->bind_param("s", $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

$tableros = [];
while ($row = $result->fetch_assoc()) {
    $tableros[] = $row;
}

// Función para calcular el tiempo pasado (si quieres mostrar el tiempo de creación)
function tiempoPasado($tiempo)
{
    $tiempoPasado = strtotime($tiempo);
    $current_time = time();
    $time_difference = $current_time - $tiempoPasado;

    $segundos = $time_difference;
    $minutos      = round($segundos / 60);
    $horas        = round($segundos / 3600);
    $dias         = round($segundos / 86400);
    $semanas        = round($segundos / 604800);
    $meses       = round($segundos / 2629440);
    $anyos        = round($segundos / 31553280);

    if ($segundos <= 60) {
        return "Hace $segundos segundos";
    } else if ($minutos <= 60) {
        return ($minutos == 1) ? "Hace un minuto" : "Hace $minutos minutos";
    } else if ($horas <= 24) {
        return ($horas == 1) ? "Hace una hora" : "Hace $horas horas";
    } else if ($dias <= 7) {
        return ($dias == 1) ? "Ayer" : "Hace $dias días";
    } else if ($semanas <= 4.3) {
        return ($semanas == 1) ? "Hace una semana" : "Hace $semanas semanas";
    } else if ($meses <= 12) {
        return ($meses == 1) ? "Hace un mes" : "Hace $meses meses";
    } else {
        return ($anyos == 1) ? "Hace un año" : "Hace $anyos años";
    }
}

// Agregar la última actividad en formato relativo al tablero
foreach ($tableros as $key => $tablero) {
    $tableros[$key]['fecha_creacion_relativa'] = tiempoPasado($tablero['fecha_creacion']);
}

echo json_encode([
    "success" => true,
    "tableros" => $tableros
]);

$stmt->close();
$conn->close();
?>
