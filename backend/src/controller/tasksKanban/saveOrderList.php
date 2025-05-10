<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php'; // tu archivo de conexión

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['orden']) || !is_array($data['orden'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $orden = $data['orden'];

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE estados SET orden = ? WHERE id = ?");

    foreach ($orden as $item) {
        if (!isset($item['id'], $item['orden'])) continue;
        $stmt->execute([$item['orden'], $item['id']]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor', 'details' => $e->getMessage()]);
}
