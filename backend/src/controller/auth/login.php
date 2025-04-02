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

$data = json_decode(file_get_contents("php://input"), true);
error_log(print_r($data, true));

if (isset($data["email"], $data["password"])) {
    $email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
    $password = $data["password"];

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

        if (password_verify($password, $user['password'])) {
            //$token = generar_token($user['id']);
            $token = bin2hex(random_bytes(32));
            echo json_encode([
                "status" => "success",
                "token" => $token,
                "user" => [
                    "id" => $user["id"],
                    "nombre" => $user["nombre"]
                ]
            ]);
            echo json_encode(["status" => "success", "token" => $token]);
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


