<?php
// checkToken.php
session_start();  // Iniciar la sesión

// Comprobamos si el token existe en la sesión
if (isset($_SESSION['token'])) {
    // Si el token está presente, lo comparamos con el token enviado en la solicitud
    $token = isset($_GET['token']) ? $_GET['token'] : null;

    if ($token && $token === $_SESSION['token']) {
        // Si el token es válido
        echo json_encode(["status" => "success", "message" => "Token válido"]);
    } else {
        // Si el token no es válido
        echo json_encode(["status" => "error", "message" => "Token inválido o expirado"]);
    }
} else {
    // Si no existe un token en la sesión
    echo json_encode(["status" => "error", "message" => "No se ha proporcionado un token"]);
}
?>
