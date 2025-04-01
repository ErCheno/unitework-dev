<?php
require_once "../../config/db.php";
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Leer los datos JSON del frontend
$data = json_decode(file_get_contents("php://input"), true);
error_log(print_r($data, true)); 

if (isset($data["email"], $data["password"])) {
    $email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
    $password = $data["password"];

    // Verificar que la conexión está funcionando
    if (!$conn) {
        die(json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]));
    }

    // Preparar la consulta SQL
    $stmt = $conn->prepare("SELECT id, nombre, password FROM usuarios WHERE email = ?");
    if (!$stmt) {
        die(json_encode(["status" => "error", "message" => "Error en la consulta SQL: " . $conn->error]));
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verificar la contraseña
        if (password_verify($password, $user['password'])) {
            $_SESSION['usuario_id'] = $user['id'];
            echo json_encode(["status" => "success", "message" => "Inicio de sesión exitoso"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Contraseña incorrecta"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}

$conn->close();
exit();
?>
