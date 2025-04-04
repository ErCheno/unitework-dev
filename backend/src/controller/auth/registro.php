<?php

require_once "../../config/db.php"; 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejo de preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar conexión con la base de datos
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit();
}

// Obtener datos del JSON enviado
$data = json_decode(file_get_contents("php://input"), true);

// Verificar que se recibieron los datos
if (!isset($data["name"], $data["email"], $data["password"], $data["confirmPassword"])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit();
}

$name = htmlspecialchars(strip_tags($data["name"]));
$email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
$password = $data["password"];
$confirmPassword = $data["confirmPassword"];

// Verificar que las contraseñas coincidan
if ($password !== $confirmPassword) {
    echo json_encode(["status" => "error", "message" => "Las contraseñas no coinciden"]);
    exit();
}

// Verificar si el email ya está registrado
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado"]);
    $stmt->close(); 
    exit();
}

// Si el email no está registrado, hash de la contraseña
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insertar el usuario en la base de datos
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registro exitoso"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al registrar el usuario"]);
}

$stmt->close();
$conn->close();

?>
