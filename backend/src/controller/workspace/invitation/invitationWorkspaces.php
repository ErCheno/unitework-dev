<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../../config/db.php';
require_once __DIR__ . '/../../../vendor/autoload.php'; // Incluir PHPMailer con Composer
require_once "../../auth/tokenUtils.php";

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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['creado_por']) || empty($input['email']) || empty($input['espacio_trabajo_id']) || empty($input['tablero_id']) || empty($input['rol_espacio_trabajo']) || empty($input['rol_tablero'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros obligatorios']);
    exit;
}

$userId = verificarToken($conn); // Llamada a la función que obtiene el ID del usuario del token
$email = $input['email'];
$espacioTrabajoId = $input['espacio_trabajo_id'];
$tableroId = $input['tablero_id'];
$rolEspacioTrabajo = $input['rol_espacio_trabajo'];
$rolTablero = $input['rol_tablero'];

// Verificar que el usuario existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}
$stmt->close();

// Verificar si el espacio de trabajo y tablero existen
$stmt = $conn->prepare("SELECT id FROM espacios_trabajo WHERE id = ?");
$stmt->bind_param("i", $espacioTrabajoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El espacio de trabajo no existe"]);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("SELECT id FROM tableros WHERE id = ?");
$stmt->bind_param("i", $tableroId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El tablero no existe"]);
    exit;
}
$stmt->close();

// Generar un token único para la invitación
$token = bin2hex(random_bytes(32));

// Insertar la invitación en la base de datos
$stmt = $conn->prepare("INSERT INTO invitaciones (email, espacio_trabajo_id, tablero_id, rol_espacio_trabajo, rol_tablero, estado, token, fecha_envio) VALUES (?, ?, ?, ?, ?, 'pendiente', ?, NOW())");
$stmt->bind_param("siiiss", $email, $espacioTrabajoId, $tableroId, $rolEspacioTrabajo, $rolTablero, $token);
$executeSuccess = $stmt->execute();
$stmt->close();

if ($executeSuccess) {
    // Enviar el correo de invitación
    $mail = new PHPMailer(true);
    try {
        // Configuración de PHPMailer
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';  // Servidor SMTP de Gmail
        $mail->SMTPAuth = true;
        $mail->Username = 'tucorreo@gmail.com';  // Tu dirección de correo electrónico de Gmail
        $mail->Password = 'tu-contraseña';  // Tu contraseña de Gmail o contraseña de aplicación
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;  // Puerto estándar para Gmail
        
        // Destinatario
        $mail->setFrom('tucorreo@gmail.com', 'Tu Nombre');
        $mail->addAddress($email);

        // Contenido del correo
        $mail->isHTML(true);
        $mail->Subject = 'Invitación a tablero';
        $mail->Body    = "Has sido invitado al tablero con el rol de $rolTablero en el espacio de trabajo. Usa el siguiente enlace para aceptar la invitación: <a href='https://tusitio.com/aceptar-invitacion?token=$token'>Aceptar Invitación</a>";

        // Enviar el correo
        $mail->send();
        echo json_encode(["success" => true, "message" => "Invitación enviada correctamente", "token" => $token]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "No se pudo enviar el correo: {$mail->ErrorInfo}"]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Error al enviar la invitación"]);
}

$conn->close();
?>
