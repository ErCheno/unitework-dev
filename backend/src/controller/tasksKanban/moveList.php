<?php
require_once "../../config/db.php";
require_once "../auth/tokenUtils.php";

require_once "../../config/env.php";


$server = getEnvVar('SERVER', 'localhost');
header("Access-Control-Allow-Origin: http://$server:5173");header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

// Obtener datos del cuerpo de la solicitud
$input = json_decode(file_get_contents("php://input"), true);

// Validación básica de los datos recibidos
$tableroId = isset($input['tablero_id']) ? (int)$input['tablero_id'] : null;
$nuevoOrden = isset($input['posicion']) && is_array($input['posicion']) ? $input['posicion'] : [];

if ($tableroId === null || empty($nuevoOrden)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos o inválidos"]);
    exit();
}

// Verificar que el tableroId sea un número positivo
if ($tableroId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID de tablero inválido"]);
    exit();
}

// Verificación del token de usuario
$usuario = verificarToken($conn);
if (!$usuario) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Token de autenticación no válido o expirado"]);
    exit();
}

$usuarioId = $usuario['id'];

// Verificar permisos del usuario sobre el tablero
$stmtPermiso = $conn->prepare("
    SELECT 1 
    FROM miembros_tableros 
    WHERE usuario_id = ? AND tablero_id = ?
");
$stmtPermiso->bind_param("si", $usuarioId, $tableroId);
$stmtPermiso->execute();
$result = $stmtPermiso->get_result();

if ($result->num_rows === 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "No tienes permiso para mover listas en este tablero"]);
    exit();
}
$stmtPermiso->close();

// Preparar sentencia para actualizar el posicionamiento de las listas
$stmtUpdate = $conn->prepare("
    UPDATE estados_tareas 
    SET posicionamiento = ? 
    WHERE id = ? AND tablero_id = ?
");

// Comenzar la transacción
$conn->begin_transaction();

try {
    foreach ($nuevoOrden as $lista) {
        // Validar cada lista en el nuevo orden
        if (!isset($lista['listaId'], $lista['posicionamiento']) ||
            !is_int($lista['listaId']) || $lista['listaId'] <= 0 ||
            !is_int($lista['posicionamiento']) || $lista['posicionamiento'] < 0) {
            throw new Exception("Datos inválidos en el orden de las listas.");
        }

        $listaId = $lista['listaId'];
        $posicion = $lista['posicionamiento'];

        // Validación adicional de la listaId y posicionamiento
        if ($listaId <= 0) {
            throw new Exception("ID de lista inválido: $listaId");
        }

        // Vincular parámetros y ejecutar la actualización
        $stmtUpdate->bind_param("iii", $posicion, $listaId, $tableroId);
        if (!$stmtUpdate->execute()) {
            throw new Exception("Error al actualizar la posición de la lista ID $listaId");
        }
    }

    // Confirmar la transacción
    $conn->commit();

    $sqlUpdateActividad = "UPDATE tableros SET ultima_actividad = NOW() WHERE id = ?";
    $stmtUpdateKanban = $conn->prepare($sqlUpdateActividad);
    if ($stmtUpdateKanban) {
        $stmtUpdateKanban->bind_param("i", $tableroId);
        $stmtUpdateKanban->execute();
        $stmtUpdateKanban->close();
        // No hace falta manejar errores aquí a menos que quieras mostrar un warning
    }

    echo json_encode(["success" => true, "message" => "Orden de listas actualizado correctamente"]);
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al mover las listas: " . $e->getMessage()]);
}

// Cerrar las conexiones
$stmtUpdate->close();
$conn->close();
