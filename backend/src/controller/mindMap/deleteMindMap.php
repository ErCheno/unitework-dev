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
    $stmt->close();
    exit;
}

$datos = $result->fetch_assoc();
$esAdminMapa = $datos['rol_mapa'] === 'admin';
$esAdminEspacio = $datos['rol_espacio'] === 'admin';
$stmt->close();

if (!$esAdminMapa && !$esAdminEspacio) {
    echo json_encode(["success" => false, "message" => "No tienes permisos de administrador para eliminar este mapa mental"]);
    exit;
}

// Obtener espacio_trabajo_id del mapa mental antes de borrar
$stmt = $conn->prepare("SELECT espacio_trabajo_id FROM mapas_mentales WHERE id = ?");
$stmt->bind_param("i", $mapaId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Mapa mental no encontrado"]);
    $stmt->close();
    exit;
}

$fila = $result->fetch_assoc();
$espacioTrabajoId = $fila['espacio_trabajo_id'];
$stmt->close();

// Eliminar el mapa mental
$stmt = $conn->prepare("DELETE FROM mapas_mentales WHERE id = ?");
$stmt->bind_param("i", $mapaId);
$deleteOk = $stmt->execute();
$stmt->close();

if ($deleteOk) {
    // Obtener la última actividad del espacio de trabajo para mostrarla formateada
    $stmt_actividad = $conn->prepare("SELECT ultima_actividad FROM espacios_trabajo WHERE id = ?");
    $stmt_actividad->bind_param("i", $espacioTrabajoId);
    $stmt_actividad->execute();
    $result_actividad = $stmt_actividad->get_result();
    $actividadData = $result_actividad->fetch_assoc();
    $stmt_actividad->close();

    $ultimaActividad = $actividadData ? $actividadData['ultima_actividad'] : null;
    $ultimaActividadRelativa = $ultimaActividad ? tiempoPasado($ultimaActividad) : "Sin actividad reciente";

    echo json_encode(["success" => true, "message" => "Mapa mental eliminado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al eliminar el mapa mental"]);
}

$conn->close();

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
