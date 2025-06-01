<?php
require_once "../../config/db.php"; 
require_once __DIR__ . '/../../../vendor/autoload.php';

use Ramsey\Uuid\Uuid;

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

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["name"], $data["email"], $data["password"], $data["confirmPassword"])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit();
}

$name = htmlspecialchars(strip_tags($data["name"]));
$email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
$password = $data["password"];
$confirmPassword = $data["confirmPassword"];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "El correo electrónico no es válido"]);
    exit();
}

if ($password !== $confirmPassword) {
    echo json_encode(["status" => "error", "message" => "Las contraseñas no coinciden"]);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado"]);
    $stmt->close(); 
    exit();
}
$stmt->close();

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$usuario_id = Uuid::uuid4()->toString();
$avatar_url = 'default-avatar.png';

// Insertar usuario
$stmt = $conn->prepare("INSERT INTO usuarios (id, nombre, email, password, avatar_url) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $usuario_id, $name, $email, $hashedPassword, $avatar_url);

if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Error al registrar el usuario"]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Crear espacio de trabajo
$fecha_actual = date("Y-m-d H:i:s");
$rol_admin = "Administrador";

$nombre_espacio = "Espacio de $name";
$descripcion_espacio = "Espacio creado automáticamente para $name";

$stmt = $conn->prepare("INSERT INTO espacios_trabajo (nombre, descripcion, creado_por, fecha_creacion, ultima_actividad) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $nombre_espacio, $descripcion_espacio, $usuario_id, $fecha_actual, $fecha_actual);
$stmt->execute();
$workspace_id = $stmt->insert_id;
$stmt->close();

// Asignar al usuario como miembro del espacio
$stmt = $conn->prepare("INSERT INTO miembros_espacios_trabajo (usuario_id, espacio_trabajo_id, rol) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $usuario_id, $workspace_id, $rol_admin);
$stmt->execute();
$stmt->close();

// Crear tablero
$nombre_tablero = "Tablero de $name";
$descripcion_tablero = "Tablero inicial creado automáticamente";
$color_tablero = "#3498db";

$stmt = $conn->prepare("INSERT INTO tableros (nombre, descripcion, espacio_trabajo_id, creado_por, fecha_creacion, ultima_actividad, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssissss", $nombre_tablero, $descripcion_tablero, $workspace_id, $usuario_id, $fecha_actual, $fecha_actual, $color_tablero);
$stmt->execute();
$tablero_id = $stmt->insert_id;
$stmt->close();

// Asignar al usuario como miembro del tablero
$stmt = $conn->prepare("INSERT INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $usuario_id, $tablero_id, $rol_admin);
$stmt->execute();
$stmt->close();

// Crear mapa mental
$titulo_mapa = "Mapa mental de $name";
$descripcion_mapa = "Mapa mental inicial creado automáticamente";
$color_mapa = "#2ecc71";

$stmt = $conn->prepare("INSERT INTO mapas_mentales (titulo, descripcion, espacio_trabajo_id, creado_por, fecha_creacion, fecha_modificacion, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssissss", $titulo_mapa, $descripcion_mapa, $workspace_id, $usuario_id, $fecha_actual, $fecha_actual, $color_mapa);
$stmt->execute();
$mapa_id = $stmt->insert_id;
$stmt->close();

// Asignar al usuario como miembro del mapa mental
$stmt = $conn->prepare("INSERT INTO miembros_mapas_mentales (usuario_id, mapa_mental_id, rol) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $usuario_id, $mapa_id, $rol_admin);
$stmt->execute();
$stmt->close();

echo json_encode(["status" => "success", "message" => "Registro exitoso con entorno creado", "id" => $usuario_id]);

$conn->close();
?>
