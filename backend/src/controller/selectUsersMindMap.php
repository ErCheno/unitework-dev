<?php
require_once "../config/db.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
$baseAvatarUrl = "http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/";

// Obtener usuarios que ya están en el mapa mental con su rol
$query = "
    SELECT u.id, u.nombre, u.email, u.avatar_url, mm.rol
    FROM usuarios u
    INNER JOIN miembros_mapas_mentales mm ON u.id = mm.usuario_id
    WHERE mm.mapa_mental_id = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $mapa_id);
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
        'rol' => $row['rol'],
    ];
}

echo json_encode([
    "success" => true,
    "usuarios_disponibles" => $usuarios
]);

$stmt->close();
$conn->close();
