<?php
require_once "../config/db.php";

require_once "./../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || empty($input['mapa_id'])) {
    echo json_encode(["success" => false, "message" => "El campo mapa_id es obligatorio"]);
    exit();
}

$mapa_id = intval($input['mapa_id']);
$filtro = isset($input['filtro']) ? '%' . $input['filtro'] . '%' : '%';

$baseAvatarUrl = "http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/";

// Obtener IDs de usuarios que ya están en el mapa
$stmt = $conn->prepare("SELECT usuario_id FROM miembros_mapas WHERE mapa_id = ?");
$stmt->bind_param("i", $mapa_id);
$stmt->execute();
$result = $stmt->get_result();

$miembrosExistentes = [];
while ($row = $result->fetch_assoc()) {
    $miembrosExistentes[] = $row['usuario_id'];
}
$stmt->close();

$usuariosDisponibles = [];

if (!empty($miembrosExistentes)) {
    $placeholders = implode(',', array_fill(0, count($miembrosExistentes), '?'));
    $types = str_repeat('i', count($miembrosExistentes));

    $query = "SELECT id, nombre, email, avatar_url FROM usuarios 
              WHERE CONCAT(nombre, ' ', email) LIKE ? AND id NOT IN ($placeholders)";

    $stmt = $conn->prepare($query);
    $bindParams = array_merge([$filtro], $miembrosExistentes);
    $stmt->bind_param(str_repeat('s', 1) . $types, ...$bindParams);
} else {
    $stmt = $conn->prepare("SELECT id, nombre, email, avatar_url FROM usuarios 
                            WHERE CONCAT(nombre, ' ', email) LIKE ?");
    $stmt->bind_param("s", $filtro);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $usuariosDisponibles[] = [
        'id' => $row['id'],
        'nombre' => $row['nombre'],
        'email' => $row['email'],
        'avatar_url' => $row['avatar_url'] 
            ? $baseAvatarUrl . $row['avatar_url']
            : $baseAvatarUrl . 'default-avatar.png',
    ];
}

echo json_encode([
    "success" => true,
    "usuarios_disponibles" => $usuariosDisponibles
]);

$stmt->close();
$conn->close();
