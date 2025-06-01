<?php
require_once "../../config/db.php";
require_once "../../auth/tokenUtils.php";

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

// Leer parámetro de orden
$orden = $_GET['orden'] ?? 'nombre_asc';
$selectExtra = "";
$ordenSql = match ($orden) {
    'nombre_desc' => "ORDER BY et.nombre DESC",
    'kanban'      => ", (SELECT COUNT(*) FROM tableros t WHERE t.espacio_trabajo_id = et.id) AS num_tableros ORDER BY num_tableros DESC",
    'mapas'       => ", (SELECT COUNT(*) FROM mapas_mentales m WHERE m.espacio_trabajo_id = et.id) AS num_mapas_mentales ORDER BY num_mapas_mentales DESC",
    'usuarios'    => ", (SELECT COUNT(*) FROM miembros_espacios_trabajo me2 WHERE me2.espacio_trabajo_id = et.id) AS num_usuarios ORDER BY num_usuarios DESC",
    default       => "ORDER BY et.nombre ASC",
};

if (str_starts_with($ordenSql, ",")) {
    $selectExtra = strstr($ordenSql, " ORDER BY", true); // parte del SELECT extra
    $ordenSql = strstr($ordenSql, " ORDER BY"); // parte del ORDER BY
}

// Consulta principal
$sql = "
    SELECT et.*, met.rol $selectExtra
    FROM espacios_trabajo et
    JOIN miembros_espacios_trabajo met ON et.id = met.espacio_trabajo_id
    WHERE met.usuario_id = ?
    $ordenSql
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

$workspaces = [];
while ($row = $result->fetch_assoc()) {
    $id = $row['id'];

    $row['num_tableros'] = contar($conn, "tableros", "espacio_trabajo_id", $id);
    $row['num_usuarios'] = contar($conn, "miembros_espacios_trabajo", "espacio_trabajo_id", $id);
    $row['num_mapas_mentales'] = contar($conn, "mapas_mentales", "espacio_trabajo_id", $id);
    $row['ultima_actividad_relativa'] = tiempoPasado($row['ultima_actividad']);

    $workspaces[] = $row;
}

echo json_encode([
    "success" => true,
    "workspaces" => $workspaces
]);

$conn->close();


// Funciones auxiliares
function contar($conn, $tabla, $columna, $valor) {
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM $tabla WHERE $columna = ?");
    $stmt->bind_param("i", $valor);
    $stmt->execute();
    $res = $stmt->get_result();
    $count = $res->fetch_assoc()['total'] ?? 0;
    $stmt->close();
    return $count;
}

function tiempoPasado($tiempo) {
    $tiempoPasado = strtotime($tiempo);
    $diferencia = time() - $tiempoPasado;

    if ($diferencia < 60) return "Hace $diferencia segundos";
    $min = round($diferencia / 60);
    if ($min < 60) return "Hace $min minutos";
    $hor = round($min / 60);
    if ($hor < 24) return "Hace $hor horas";
    $dias = round($hor / 24);
    if ($dias === 1) return "Ayer";
    if ($dias < 7) return "Hace $dias días";
    $semanas = round($dias / 7);
    if ($semanas < 5) return "Hace $semanas semanas";
    $meses = round($dias / 30);
    if ($meses < 12) return "Hace $meses meses";
    $años = round($dias / 365);
    return "Hace $años años";
}
