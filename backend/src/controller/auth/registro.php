<?php

require_once "../../config/db.php"; 
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

// Verificar que se recibieron los datos necesarios
if (isset($data["name"], $data["email"], $data["password"], $data["confirmPassword"])) {
    $name = filter_var($data["name"], FILTER_SANITIZE_STRING);
    $email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
    $password = $data["password"];
    $confirmPassword = $data["confirmPassword"];

    // Verificar que las contraseñas coincidan
    if ($password !== $confirmPassword) {
        echo json_encode(["status" => "error", "message" => "Las contraseñas no coinciden"]);
        exit();
    }

    // Verificar si el email ya está registrado (SELECT)
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado"]);
    } else {
        // Si el email no está registrado, hash de la contraseña
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insertar el nuevo usuario en la base de datos (INSERT)
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $hashedPassword);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Registro exitoso"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Hubo un problema al registrar el usuario"]);
        }
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}

$conn->close();

?>
