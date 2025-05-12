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

$input = json_decode(file_get_contents("php://input"), true);
$tableroId = $input['tablero_id'] ?? null;
$nuevoOrden = $input['posicion'] ?? [];

if (!$tableroId || !is_array($nuevoOrden) || empty($nuevoOrden)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos o inválidos"]);
    exit();
}

$usuario = verificarToken($conn);
$usuarioId = $usuario['id'];

// Verificar acceso
$stmtAcceso = $conn->prepare("SELECT 1 FROM miembros_tableros WHERE usuario_id = ? AND tablero_id = ?");
$stmtAcceso->bind_param("si", $usuarioId, $tableroId);
$stmtAcceso->execute();
$result = $stmtAcceso->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No tienes permiso para mover las listas en este tablero"]);
    exit();
}
$stmtAcceso->close();

// Preparar la actualización
$stmtUpdate = $conn->prepare("UPDATE estados_tareas SET posicionamiento = ? WHERE id = ? AND tablero_id = ?");
$conn->begin_transaction();

try {
    foreach ($nuevoOrden as $estadoData) {
        $estadoId = $estadoData['listaId'];
        $posicionamiento = $estadoData['posicionamiento'];

        if (!is_int($estadoId) || !is_int($posicionamiento)) {
            throw new Exception("Datos inválidos en la lista");
        }

        $stmtUpdate->bind_param("iii", $posicionamiento, $estadoId, $tableroId);
        if (!$stmtUpdate->execute()) {
            throw new Exception("Error al actualizar la lista ID $estadoId");
        }
    }

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$stmtUpdate->close();
$conn->close();
