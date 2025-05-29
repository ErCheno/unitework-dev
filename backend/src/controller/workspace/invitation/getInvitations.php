<?php

require_once __DIR__ . '/../../../config/db.php';
require_once "../../auth/tokenUtils.php";

require_once "../../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$usuario = verificarToken($conn);
$userId = $usuario['id'];

// Obtener el email del usuario autenticado
$stmt = $conn->prepare("SELECT email FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

$email = $result->fetch_assoc()['email'];
$stmt->close();

// Marcar como expiradas las invitaciones pendientes cuya fecha ya venció
$updateExpired = $conn->query("
    UPDATE invitaciones 
    SET estado = 'expirada' 
    WHERE estado = 'pendiente' 
      AND fecha_expiracion IS NOT NULL 
      AND fecha_expiracion < NOW()
");

if (!$updateExpired) {
    echo json_encode(["success" => false, "message" => "Error al actualizar las invitaciones expiradas"]);
    exit;
}

// Consultar invitaciones pendientes válidas con datos del remitente en una sola consulta
$stmt = $conn->prepare("
    SELECT 
        i.id, 
        i.email, 
        i.espacio_trabajo_id, 
        i.tablero_id, 
        i.mapa_id,
        i.rol, 
        i.token, 
        i.fecha_envio,
        i.fecha_expiracion,
        i.remitente_id,
        et.nombre AS nombre_espacio_trabajo,
        t.nombre AS nombre_tablero,
        m.titulo AS nombre_mapa,
        u.nombre AS nombre_remitente,
        u.avatar_url AS avatar_url_remitente
    FROM 
        invitaciones i
    LEFT JOIN 
        espacios_trabajo et ON i.espacio_trabajo_id = et.id
    LEFT JOIN 
        tableros t ON i.tablero_id = t.id
    LEFT JOIN
        mapas_mentales m ON i.mapa_id = m.id
    LEFT JOIN 
        usuarios u ON i.remitente_id = u.id
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
    // Si el remitente es null, poner valores por defecto
    if (!$row['nombre_remitente']) {
        $row['nombre_remitente'] = 'Usuario desconocido';
    }
    if (!$row['avatar_url_remitente']) {
        $row['avatar_url_remitente'] = null;
    }

    // Añadir un campo "nombre_objeto" que sea el nombre del tablero, mapa o espacio según corresponda
    if ($row['tablero_id']) {
        $row['nombre_objeto'] = $row['nombre_tablero'];
    } elseif ($row['mapa_id']) {
        $row['nombre_objeto'] = $row['nombre_mapa'];
    } else {
        $row['nombre_objeto'] = $row['nombre_espacio_trabajo'];
    }

    // Añadir un campo explícito "rol_objeto" con el rol para el objeto (tablero, mapa o espacio)
    $row['rol_objeto'] = $row['rol'];

    // Limpiar campos no necesarios para no duplicar datos
    unset($row['nombre_tablero'], $row['nombre_mapa']);

    $invitaciones[] = $row;
}

echo json_encode(["success" => true, "invitaciones" => $invitaciones]);

$conn->close();
