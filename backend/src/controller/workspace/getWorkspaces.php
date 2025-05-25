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
$orden = $_GET['orden'] ?? 'nombre_asc';
$ordenSql = "";

// Construir la parte de ordenamiento
switch ($orden) {
    case 'nombre_asc':
        $ordenSql = "ORDER BY et.nombre ASC";
        break;
    case 'nombre_desc':
        $ordenSql = "ORDER BY et.nombre DESC";
        break;
    case 'kanban':
        $ordenSql = "ORDER BY et.numero_tableros DESC";
        break;
    case 'usuarios':
        $ordenSql = "ORDER BY et.numero_mapas_mentales DESC";
        break;
    default:
        $ordenSql = "ORDER BY et.nombre ASC";
}

// Consulta SQL base
if ($orden === 'usuarios') {
    $sql = "
        SELECT et.*, met.rol, (
            SELECT COUNT(*) FROM miembros_espacios_trabajo m
            WHERE m.espacio_trabajo_id = et.id
        ) as num_usuarios
        FROM espacios_trabajo et
        INNER JOIN miembros_espacios_trabajo met ON et.id = met.espacio_trabajo_id
        WHERE met.usuario_id = ?
        ORDER BY num_usuarios DESC
    ";
} else {
    $sql = "
        SELECT DISTINCT et.*, met.rol
        FROM espacios_trabajo et
        INNER JOIN miembros_espacios_trabajo met ON et.id = met.espacio_trabajo_id
        WHERE met.usuario_id = ?
        $ordenSql
    ";
}

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

    // Actualizar en la BD
    $stmt3 = $conn->prepare("UPDATE espacios_trabajo SET numero_tableros = ? WHERE id = ?");
    $stmt3->bind_param("ii", $numTableros, $workspaceId);
    $stmt3->execute();
    $stmt3->close();

    // Agregar el número de tableros
    $row['num_tableros'] = $numTableros;

    // Aquí NO actualizamos la última actividad para que no cambie en cada carga
    // $stmt5 = $conn->prepare("UPDATE espacios_trabajo SET ultima_actividad = NOW() WHERE id = ?");
    // $stmt5->bind_param("i", $workspaceId);
    // $stmt5->execute();
    // $stmt5->close();

    // Formatear última actividad para mostrarla
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
