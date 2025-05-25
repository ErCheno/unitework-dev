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

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

$input = json_decode(file_get_contents("php://input"), true);
$titulo = trim($input['titulo'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');
$espacioTrabajoId = $input['espacio_trabajo_id'] ?? null;

if (!$titulo || !$espacioTrabajoId) {
    echo json_encode([
        "success" => false,
        "message" => "El título y el ID del espacio de trabajo son obligatorios"
    ]);
    exit();
}

// Verificar que el usuario es miembro del espacio de trabajo
$stmt = $conn->prepare("SELECT id FROM miembros_espacios_trabajo WHERE espacio_trabajo_id = ? AND usuario_id = ?");
$stmt->bind_param("is", $espacioTrabajoId, $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No perteneces a este espacio de trabajo"]);
    exit();
}
$stmt->close();

// Insertar el nuevo mapa mental
$color = $input['color'] ?? null; // Nuevo campo recibido del front


$stmt = $conn->prepare("INSERT INTO mapas_mentales (titulo, descripcion, espacio_trabajo_id, creado_por, fecha_creacion, color) VALUES (?, ?, ?, ?, NOW(), ?)");
$stmt->bind_param("ssiss", $titulo, $descripcion, $espacioTrabajoId, $usuarioId, $color);


if ($stmt->execute()) {
    $nuevoMapaId = $stmt->insert_id;
    $stmt->close();

    // Asignar al creador como admin del mapa mental
    $stmt = $conn->prepare("INSERT INTO miembros_mapas_mentales (mapa_mental_id, usuario_id, rol) VALUES (?, ?, 'admin')");
    $stmt->bind_param("is", $nuevoMapaId, $usuarioId);
    $stmt->execute();
    $stmt->close();

    // Crear nodo raíz
    $stmt = $conn->prepare("INSERT INTO nodos_mapa (mapa_id, contenido, padre_id, orden) VALUES (?, 'Nodo raíz', NULL, 0)");
    $stmt->bind_param("i", $nuevoMapaId);
    if (!$stmt->execute()) {
        echo json_encode(["success" => false, "message" => "Error al crear nodo raíz"]);
        $stmt->close();
        $conn->close();
        exit();
    }
    $nodoRaizId = $stmt->insert_id;
    $stmt->close();

    // Crear 3 hijos del nodo raíz
    // Crear 3 hijos del nodo raíz
    $stmt = $conn->prepare("INSERT INTO nodos_mapa (mapa_id, contenido, padre_id, orden) VALUES (?, ?, ?, ?)");
    for ($i = 1; $i <= 3; $i++) {
        $contenido = "Hijo $i";
        $orden = $i - 1;
        $stmt->bind_param("isii", $nuevoMapaId, $contenido, $nodoRaizId, $orden);
        $stmt->execute();
    }
    $stmt->close();

    // Incrementar contador de mapas mentales en el espacio de trabajo
    $stmt = $conn->prepare("UPDATE espacios_trabajo SET numero_mapas_mentales = numero_mapas_mentales + 1 WHERE id = ?");
    $stmt->bind_param("i", $espacioTrabajoId);
    $stmt->execute();
    $stmt->close();


    // Obtener la última actividad del espacio de trabajo para mostrarla formateada
    $stmt_actividad = $conn->prepare("SELECT ultima_actividad FROM espacios_trabajo WHERE id = ?");
    $stmt_actividad->bind_param("i", $espacioTrabajoId);
    $stmt_actividad->execute();
    $result_actividad = $stmt_actividad->get_result();
    $actividadData = $result_actividad->fetch_assoc();
    $stmt_actividad->close();

    $ultimaActividad = $actividadData ? $actividadData['ultima_actividad'] : null;
    $ultimaActividadRelativa = $ultimaActividad ? tiempoPasado($ultimaActividad) : "Sin actividad reciente";

    echo json_encode([
        "success" => true,
        "message" => "Mapa mental creado correctamente con nodo raíz y 3 hijos",
        "mapa_mental_id" => $nuevoMapaId
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear el mapa mental: " . $stmt->error
    ]);
    $stmt->close();
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
