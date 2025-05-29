<?php
require_once "../../config/db.php"; 
require_once __DIR__ . '/../../../vendor/autoload.php';

use Ramsey\Uuid\Uuid;

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Manejo de la solicitud OPTIONS (preflight)
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

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$uuid = Uuid::uuid4()->toString();

$avatar_url = 'default-avatar.png';

$stmt = $conn->prepare("INSERT INTO usuarios (id, nombre, email, password, avatar_url) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $uuid, $name, $email, $hashedPassword, $avatar_url);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registro exitoso", "id" => $uuid]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al registrar el usuario"]);
}

$stmt->close();
$conn->close();
?>
