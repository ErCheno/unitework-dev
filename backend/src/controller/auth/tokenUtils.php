<?php

function verificarToken($conn)
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token no proporcionado"]);
        exit();
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);

    $stmt = $conn->prepare("SELECT id, email FROM usuarios WHERE token = ? AND token_expira > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token inválido o expirado"]);
        exit();
    }

    return $res->fetch_assoc(); // Devuelve ['id' => ..., 'email' => ...]
}
