<?php
require_once "../../config/db.php";
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if (!$conn) {
        throw new Exception("Error de conexión con la base de datos");
    }

    // === VALIDACIÓN DEL TOKEN ===
    $usuarioId = verificarToken($conn); // Llamada a la función que obtiene el ID del usuario del token

    // === LÓGICA DE CREACIÓN DE ESPACIO ===
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['nombre'])) {
        throw new Exception("Datos inválidos");
    }

    $nombre = $input['nombre'];
    $descripcion = $input['descripcion'];

    $numeroTableros = 0;
    $numeroMapasMentales = 0;
    $numeroMiembros = 0;
    $fechaCreacion = date("Y-m-d H:i:s");

    // Insertar el nuevo espacio de trabajo en la base de datos
    $stmt = $conn->prepare("INSERT INTO espacios_trabajo (nombre, descripcion, creado_por, numero_tableros, numero_mapas_mentales, numero_miembros, fecha_creacion, ultima_actividad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssiiss", $nombre, $descripcion, $usuarioId, $numeroTableros, $numeroMapasMentales, $numeroMiembros, $fechaCreacion);
    $stmt->execute();

    $workspaceId = $stmt->insert_id;

    // Insertar al usuario como administrador del nuevo espacio
    $rol = 'admin';
    $stmt2 = $conn->prepare("INSERT INTO miembros_espacios_trabajo (espacio_trabajo_id, usuario_id, rol) VALUES (?, ?, ?)");
    $stmt2->bind_param("iss", $workspaceId, $usuarioId, $rol);
    $stmt2->execute();

    // Actualizar la cantidad de miembros en el espacio
    $stmt3 = $conn->prepare("UPDATE espacios_trabajo SET numero_miembros = numero_miembros + 1 WHERE id = ?");
    $stmt3->bind_param("i", $workspaceId);
    $stmt3->execute();

    echo json_encode([
        "status" => true,
        "message" => "Espacio de trabajo creado y usuario asignado como admin",
        "workspace_id" => $workspaceId
    ]);

    // Cerrar conexiones
    $stmt->close();
    $stmt2->close();
    $stmt3->close();
    $conn->close();

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Error SQL: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}

function verificarToken($conn) {
    // Obtener el encabezado Authorization
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        throw new Exception("Token no proporcionado");
    }

    // Validar y extraer el token
    if (!preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        throw new Exception("Formato de token inválido");
    }

    $token = $matches[1];

    // Verificar el token en la base de datos
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE token = ? AND token_expira > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Token inválido o expirado");
    }

    // Retornar el ID del usuario autenticado
    $usuario = $result->fetch_assoc();
    return $usuario['id'];
}
