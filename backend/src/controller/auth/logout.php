<?php
require_once "../../config/db.php"; 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener el token desde la cabecera de la solicitud// Si no hay token, se deja vacío

if (!$token) {
    echo json_encode(["status" => "error", "message" => "Token no proporcionado"]);
    exit();
}

// Eliminar el token de la base de datos
$stmt = $conn->prepare("UPDATE usuarios SET token = NULL WHERE token = ?");
$stmt->bind_param("s", $token);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Logout exitoso"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al hacer logout"]);
}

$stmt->close();
$conn->close();

?>