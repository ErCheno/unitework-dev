<?php

require_once __DIR__ . '/../../../config/db.php';
require_once "../../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Error de conexión con la base de datos"]);
    exit();
}

$userId = verificarToken($conn);

// Obtener el email del usuario actual
$stmt = $conn->prepare("SELECT email FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

$email = $result->fetch_assoc()['email'];
$stmt->close();

// Actualizar invitaciones expiradas a estado 'expirada'
$updateExpired = $conn->query("UPDATE invitaciones SET estado = 'expirada' WHERE estado = 'pendiente' AND fecha_expiracion IS NOT NULL AND fecha_expiracion < NOW()");

if (!$updateExpired) {
    echo json_encode(["success" => false, "message" => "Error al actualizar las invitaciones expiradas"]);
    exit;
}

// Buscar invitaciones PENDIENTES válidas (no expiradas)
$stmt = $conn->prepare("
    SELECT 
        i.id, 
        i.email, 
        i.espacio_trabajo_id, 
        i.tablero_id, 
        i.rol_espacio_trabajo, 
        i.rol_tablero, 
        i.token, 
        i.fecha_envio,
        i.fecha_expiracion,
        i.remitente_id,
        et.nombre AS nombre_espacio_trabajo,
        t.nombre AS nombre_tablero
    FROM 
        invitaciones i
    LEFT JOIN 
        espacios_trabajo et ON i.espacio_trabajo_id = et.id
    LEFT JOIN 
        tableros t ON i.tablero_id = t.id
    WHERE 
        i.email = ? AND i.estado = 'pendiente'
    ORDER BY 
        i.fecha_envio DESC
");

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();


$invitaciones = [];


while ($row = $result->fetch_assoc()) {
    // Obtener nombre y avatar del remitente utilizando el remitente_id
    $remitenteId = $row['remitente_id'];
    if (isset($remitenteId) && $remitenteId != null) {
        $stmtRemitente = $conn->prepare("SELECT nombre, avatar_url FROM usuarios WHERE id = ?");
        $stmtRemitente->bind_param("i", $remitenteId);
        $stmtRemitente->execute();
        $remitenteResult = $stmtRemitente->get_result();

        if ($remitenteResult->num_rows > 0) {
            $remitente = $remitenteResult->fetch_assoc();
            $row['nombre_remitente'] = $remitente['nombre'];  // Agregar el nombre del remitente
            $row['avatar_url_remitente'] = $remitente['avatar_url'];  // Agregar el avatar_url del remitente
        } else {
            $row['nombre_remitente'] = 'Usuario desconocido';  // En caso de no encontrar al remitente
            $row['avatar_url_remitente'] = null;  // No hay avatar disponible
        }
        $stmtRemitente->close();
    } else {
        $row['nombre_remitente'] = 'Usuario desconocido';  // En caso de que no haya remitente_id
        $row['avatar_url_remitente'] = null;  // No hay avatar disponible
    }

    $invitaciones[] = $row;
}

echo json_encode(["success" => true, "invitaciones" => $invitaciones]);

$conn->close();
