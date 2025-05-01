<?php
require_once "../../config/db.php";
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data["email"], $data["password"])) {
    $email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
    $password = $data["password"];

    if (!$conn) {
        echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, nombre, password, avatar_url, email FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            // Generar un token aleatorio
            $token = bin2hex(random_bytes(32));

            // Establecer expiración en 1 hora (3600 segundos)
            $expires_at = time() + 360000;

            // Guardar token y expiración en la base de datos
            $stmt = $conn->prepare("UPDATE usuarios SET token = ?, token_expira = FROM_UNIXTIME(?) WHERE email = ?");
            $stmt->bind_param("sis", $token, $expires_at, $email);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "status" => "success",
                    "token" => $token,
                    "expira_en" => $expires_at,
                    "usuario_id" => $user["id"],
                    "nombre" => $user["nombre"],
                    "email" => $user["email"],
                    "avatar_url" => $user["avatar_url"] ?: "default-avatar.png"
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "No se pudo guardar el token"]);
            }
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
