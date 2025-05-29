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

if (!$input || empty($input['tablero_id'])) {
    echo json_encode(["success" => false, "message" => "El campo tablero_id es obligatorio"]);
    exit();
}

$tablero_id = intval($input['tablero_id']);
$baseAvatarUrl = "http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/";

// Obtener usuarios que ya están en el tablero con su rol
$query = "
    SELECT u.id, u.nombre, u.email, u.avatar_url, mt.rol
    FROM usuarios u
    INNER JOIN miembros_tableros mt ON u.id = mt.usuario_id
    WHERE mt.tablero_id = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $tablero_id);
$stmt->execute();
$result = $stmt->get_result();

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $usuarios[] = [
        'id' => $row['id'],
        'nombre' => $row['nombre'],
        'email' => $row['email'],
        'avatar_url' => $row['avatar_url']
            ? $baseAvatarUrl . $row['avatar_url']
            : $baseAvatarUrl . 'default-avatar.png',
        'rol' => $row['rol'], // Incluimos el rol
    ];
}

echo json_encode([
    "success" => true,
    "usuarios_disponibles" => $usuarios
]);

$stmt->close();
$conn->close();
