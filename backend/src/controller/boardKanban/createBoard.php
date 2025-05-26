<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// Verificar token y obtener el ID del usuario autenticado
try {
    $usuario = verificarToken($conn);
    $usuarioId = $usuario['id'];      // ID del usuario autenticado
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit();
}

// Validar datos de entrada
if (!$input || empty($input['nombre']) || empty($input['espacio_trabajo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit();
}

$nombre = $input['nombre'];
$descripcion = $input['descripcion'] ?? '';
$espacio_trabajo_id = $input['espacio_trabajo_id'];
$fecha_creacion = date('Y-m-d H:i:s');

// Insertar el tablero
$color = $input['color'] ?? null; // Nuevo campo recibido del front

$stmt = $conn->prepare("INSERT INTO tableros (nombre, descripcion, espacio_trabajo_id, creado_por, fecha_creacion, color) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssisss", $nombre, $descripcion, $espacio_trabajo_id, $usuarioId, $fecha_creacion, $color);


if ($stmt->execute()) {
    $tablero_id = $conn->insert_id;

    // Añadir al creador como miembro con rol 'admin'
    $rol = 'admin';
    $stmt_miembro = $conn->prepare("INSERT INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
    $stmt_miembro->bind_param("sis", $usuarioId, $tablero_id, $rol);

    if ($stmt_miembro->execute()) {
        // Llamada a la función para crear las listas predeterminadas
        crearListasPredeterminadas($conn, $usuarioId, $tablero_id);

        echo json_encode(['success' => true, 'message' => 'Tablero y miembro creados correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Tablero creado, pero error al añadir miembro']);
    }

    $stmt_miembro->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error al crear el tablero']);
}
// Obtener la última actividad del espacio de trabajo para mostrarla formateada
$stmt_actividad = $conn->prepare("SELECT ultima_actividad FROM espacios_trabajo WHERE id = ?");
$stmt_actividad->bind_param("i", $espacio_trabajo_id);
$stmt_actividad->execute();
$result_actividad = $stmt_actividad->get_result();
$actividadData = $result_actividad->fetch_assoc();
$stmt_actividad->close();

$ultimaActividad = $actividadData ? $actividadData['ultima_actividad'] : null;
$ultimaActividadRelativa = $ultimaActividad ? tiempoPasado($ultimaActividad) : "Sin actividad reciente";

$stmt->close();
$conn->close();

// Función para crear las listas predeterminadas
function crearListasPredeterminadas($conn, $usuarioId, $tableroId) {
    $listasPredeterminadas = ['Por hacer', 'En progreso', 'Hecho'];

    foreach ($listasPredeterminadas as $index => $nombreLista) {
        // Verificar si la lista ya existe para este tablero
        $stmt = $conn->prepare("SELECT COUNT(*) FROM estados_tareas WHERE tablero_id = ? AND nombre = ?");
        $stmt->bind_param("is", $tableroId, $nombreLista);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()['COUNT(*)'];

        // Si no existe, crear la lista con su orden
        if ($count == 0) {
            $orden = $index + 1; // Comenzar en 1
            $stmt = $conn->prepare("INSERT INTO estados_tareas (nombre, creado_por, tablero_id, posicionamiento) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssii", $nombreLista, $usuarioId, $tableroId, $orden);
            $stmt->execute();
        }
    }
}

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
