<?php
require_once "../../config/db.php";
require_once ".../../../auth/tokenUtils.php";

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
$userId = $usuario['id'];

// Leer parámetro 'orden'
// Leer parámetro 'orden'
$orden = $_GET['orden'] ?? 'nombre_asc';
$ordenSql = "";
$selectExtra = "";

// Construir la parte de ordenamiento
switch ($orden) {
    case 'nombre_asc':
        $ordenSql = "ORDER BY et.nombre ASC";
        break;
    case 'nombre_desc':
        $ordenSql = "ORDER BY et.nombre DESC";
        break;
    case 'kanban':
        $selectExtra = ", (SELECT COUNT(*) FROM tableros t WHERE t.espacio_trabajo_id = et.id) AS num_tableros";
        $ordenSql = "ORDER BY num_tableros DESC";
        break;
    case 'mapas':
        $selectExtra = ", (SELECT COUNT(*) FROM mapas_mentales m WHERE m.espacio_trabajo_id = et.id) AS num_mapas_mentales";
        $ordenSql = "ORDER BY num_mapas_mentales DESC";
        break;
    case 'usuarios':
        $selectExtra = ", (SELECT COUNT(*) FROM miembros_espacios_trabajo me WHERE me.espacio_trabajo_id = et.id) AS num_usuarios";
        $ordenSql = "ORDER BY num_usuarios DESC";
        break;
    case 'actividad_desc':
        $ordenSql = "ORDER BY et.ultima_actividad DESC";
        break;
    default:
        $ordenSql = "ORDER BY et.nombre ASC";
}


// Consulta SQL base unificada
$sql = "
    SELECT DISTINCT et.*, met.rol $selectExtra
    FROM espacios_trabajo et
    INNER JOIN miembros_espacios_trabajo met ON et.id = met.espacio_trabajo_id
    WHERE met.usuario_id = ?
    $ordenSql
";


$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

$workspaces = [];
while ($row = $result->fetch_assoc()) {
    $workspaceId = $row['id'];

    // Contar tableros
    $stmt2 = $conn->prepare("SELECT COUNT(*) as total FROM tableros WHERE espacio_trabajo_id = ?");
    $stmt2->bind_param("i", $workspaceId);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    $countData = $res2->fetch_assoc();
    $numTableros = $countData['total'];
    $stmt2->close();

    // Contar miembros reales
    $stmt4 = $conn->prepare("SELECT COUNT(*) as total FROM miembros_espacios_trabajo WHERE espacio_trabajo_id = ?");
    $stmt4->bind_param("i", $workspaceId);
    $stmt4->execute();
    $res4 = $stmt4->get_result();
    $countUsuarios = $res4->fetch_assoc();
    $numUsuarios = $countUsuarios['total'];
    $stmt4->close();

    // Contar mapas mentales
    $stmt5 = $conn->prepare("SELECT COUNT(*) as total FROM mapas_mentales WHERE espacio_trabajo_id = ?");
    $stmt5->bind_param("i", $workspaceId);
    $stmt5->execute();
    $res5 = $stmt5->get_result();
    $countMapas = $res5->fetch_assoc();
    $numMapas = $countMapas['total'];
    $stmt5->close();

    // Agregar datos al workspace
    $row['num_tableros'] = $numTableros;
    $row['num_usuarios'] = $numUsuarios;
    $row['num_mapas_mentales'] = $numMapas;

    // Formatear última actividad
    $ultimaActividad = $row['ultima_actividad'];
    $ultimaActividadRelativa = tiempoPasado($ultimaActividad);
    $row['ultima_actividad_relativa'] = $ultimaActividadRelativa;

    $workspaces[] = $row;
}


// Función para formatear fechas
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

    if ($segundos <= 60) {
        return "Hace $segundos segundos";
    } elseif ($minutos <= 60) {
        return ($minutos == 1) ? "Hace un minuto" : "Hace $minutos minutos";
    } elseif ($horas <= 24) {
        return ($horas == 1) ? "Hace una hora" : "Hace $horas horas";
    } elseif ($dias <= 7) {
        return ($dias == 1) ? "Ayer" : "Hace $dias días";
    } elseif ($semanas <= 4.3) {
        return ($semanas == 1) ? "Hace una semana" : "Hace $semanas semanas";
    } elseif ($meses <= 12) {
        return ($meses == 1) ? "Hace un mes" : "Hace $meses meses";
    } else {
        return ($anyos == 1) ? "Hace un año" : "Hace $anyos años";
    }
}

echo json_encode([
    "success" => true,
    "workspaces" => $workspaces
]);

$conn->close();
