<?php
require_once "../../config/db.php";
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // Importante

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

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['nombre']) || empty($input['descripcion']) || empty($input['creado_por'])) {
        throw new Exception("Datos inválidos");
    }

    $nombre = $input['nombre'];
    $descripcion = $input['descripcion'];
    $userId = $input['creado_por'];

    // Verificar si el usuario existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        throw new Exception("El usuario no existe");
    }

    $numeroTableros = 0;
    $numeroMapasMentales = 0;
    $numeroMiembros = 0;
    $fechaCreacion = date("Y-m-d H:i:s");
    $stmt = $conn->prepare("INSERT INTO espacios_trabajo (nombre, descripcion, creado_por, numero_tableros, numero_mapas_mentales, numero_miembros, fecha_creacion, ultima_actividad) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssiiss", $nombre, $descripcion, $userId, $numeroTableros, $numeroMapasMentales, $numeroMiembros, $fechaCreacion);
    $stmt->execute();
    
    $workspaceId = $stmt->insert_id;

    $rol = 'admin';
    $stmt2 = $conn->prepare("INSERT INTO miembros_espacios_trabajo (espacio_trabajo_id, usuario_id, rol) VALUES (?, ?, ?)");
    $stmt2->bind_param("iss", $workspaceId, $userId, $rol);
    $stmt2->execute();

    $stmt3 = $conn->prepare("UPDATE espacios_trabajo SET numero_miembros = numero_miembros + 1 WHERE id = ?");
    $stmt3->bind_param("i", $workspaceId);
    $stmt3->execute();

    echo json_encode([
        "status" => true,
        "message" => "Espacio de trabajo creado y usuario asignado como admin",
        "workspace_id" => $workspaceId
    ]);

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
