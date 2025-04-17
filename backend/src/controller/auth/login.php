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
error_log(print_r($data, true));

if (isset($data["email"], $data["password"])) {
    $email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
    $password = $data["password"];

    // Verificar conexión a la base de datos
    if (!$conn) {
        die(json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]));
    }

    // Preparar la consulta para obtener el usuario por su email
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
            // Generar un token único
            $token = bin2hex(random_bytes(32));

            // Preparar la consulta para actualizar el token en la base de datos
            $stmt = $conn->prepare("UPDATE usuarios SET token = ? WHERE email = ?");
            $stmt->bind_param("ss", $token, $email);
            $stmt->execute();

            // Verificar si la actualización fue exitosa
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "status" => "success",
                    "token" => $token,
                    "usuario_id" => $user["id"],
                    "nombre" => $user["nombre"]
                ]);
                
            } else {
                // Si no se pudo actualizar el token, se genera un error
                echo json_encode(["status" => "error", "message" => "No se pudo actualizar el token"]);
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
exit();
