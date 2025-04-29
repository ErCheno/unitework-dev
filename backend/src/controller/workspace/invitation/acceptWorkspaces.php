<?php
require_once __DIR__ . '/../../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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

if (isset($data["token"])) {
    $token = $data["token"];

    // Verificar si el token existe en la base de datos
    $stmt = $conn->prepare("SELECT * FROM invitaciones WHERE token = ? AND estado = 'pendiente'");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $invitation = $result->fetch_assoc();

        // Extraer los datos de la invitación
        $espacioTrabajoId = $invitation['espacio_trabajo_id'];
        $tableroId = $invitation['tablero_id'];
        $rolEspacioTrabajo = $invitation['rol_espacio_trabajo'];
        $rolTablero = $invitation['rol_tablero'];
        $email = $invitation['email'];

        // Verificar si el usuario existe en la base de datos
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(['status' => 'error', 'message' => 'El usuario con ese email no existe']);
            exit;
        }

        $user = $result->fetch_assoc();
        $userId = $user['id'];

        // Agregar al usuario al espacio de trabajo con el rol correspondiente
        $stmt = $conn->prepare("INSERT INTO miembros_espacios_trabajo (usuario_id, espacio_trabajo_id, rol) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $userId, $espacioTrabajoId, $rolEspacioTrabajo);
        $stmt->execute();
        $stmt->close();

        // Agregar al usuario al tablero con el rol correspondiente
        $stmt = $conn->prepare("INSERT INTO miembros_tableros (usuario_id, tablero_id, rol) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $userId, $tableroId, $rolTablero);
        $stmt->execute();
        $stmt->close();

        // Actualizar el estado de la invitación a 'aceptada'
        $stmt = $conn->prepare("UPDATE invitaciones SET estado = 'aceptada' WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['status' => 'success', 'message' => 'Invitación aceptada correctamente']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'El token no es válido o ya ha sido utilizado']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Token no proporcionado']);
}

$conn->close();
exit();
?>
