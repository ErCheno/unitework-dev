<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

// Obtener datos
$input = json_decode(file_get_contents("php://input"), true);
$nuevoOrden = $input['posicion'] ?? [];

if (!$nuevoOrden) {
    echo json_encode(["success" => false, "message" => "No se recibió el nuevo orden"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Preparar verificación de acceso
$stmtAcceso = $conn->prepare("
    SELECT mt.tablero_id 
    FROM tareas t
    INNER JOIN estados_tareas et ON t.estado_id = et.id
    INNER JOIN miembros_tableros mt ON et.tablero_id = mt.tablero_id
    WHERE t.id = ? AND mt.usuario_id = ?
");

// Preparar actualización
$stmtUpdate = $conn->prepare("UPDATE tareas SET estado_id = ?, orden = ? WHERE id = ?");

$conn->begin_transaction();

try {
    foreach ($nuevoOrden as $columna) {
        if (!isset($columna['id'], $columna['orden']) || !is_array($columna['orden'])) {
            throw new Exception("Formato inválido en los datos enviados.");
        }
        $estadoId = $columna['id'];
        foreach ($columna['orden'] as $tareaData) {
            $tareaId = $tareaData['tareaId'];
            $orden = $tareaData['orden'];

            // Verificar permiso
            $stmtAcceso->bind_param("is", $tareaId, $usuarioId);
            $stmtAcceso->execute();
            $result = $stmtAcceso->get_result();
            if ($result->num_rows === 0) {
                throw new Exception("Sin permiso para tarea ID $tareaId");
            }

            $row = $result->fetch_assoc();
            $tableroId = $row['tablero_id']; // Captura el tablero_id


            // Actualizar tarea
            $stmtUpdate->bind_param("iii", $estadoId, $orden, $tareaId);
            if (!$stmtUpdate->execute()) {
                throw new Exception("Error al actualizar tarea ID $tareaId");
            }
        }
    }

    $conn->commit();

    $sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
    $stmtUpdateKanban = $conn->prepare($sqlUpdateActividad);
    if ($stmtUpdateKanban) {
        $stmtUpdateKanban->bind_param("i", $tableroId);
        $stmtUpdateKanban->execute();
        $stmtUpdateKanban->close();
        // No hace falta manejar errores aquí a menos que quieras mostrar un warning
    }

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$stmtAcceso->close();
$stmtUpdate->close();
$conn->close();
