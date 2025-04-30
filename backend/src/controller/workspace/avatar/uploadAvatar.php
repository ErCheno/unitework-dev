<?php
require_once __DIR__ . '/../../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error de conexión con la base de datos"]);
    exit();
}

if (!isset($_FILES['avatar']) || empty($_POST['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$usuarioId = $_POST['usuario_id'];
$archivo = $_FILES['avatar'];

$stmt = $conn->prepare("SELECT avatar_url FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}

$usuario = $result->fetch_assoc();
$avatarAnterior = $usuario['avatar_url'];
$stmt->close();

// Verifica errores en el archivo
if ($archivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Error al subir el archivo"]);
    exit;
}

$ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombreArchivo = uniqid('avatar_') . '.' . $ext;

$directorioDestino = realpath(__DIR__ . '/../../../../../frontend/public/img/uploads/usuarios');

if (!$directorioDestino) {
    $directorioDestino = __DIR__ . '/../../../../../frontend/public/img/uploads/usuarios';
    if (!mkdir($directorioDestino, 0777, true)) {
        echo json_encode(["success" => false, "message" => "No se pudo crear el directorio destino"]);
        exit;
    }
}

// Eliminar avatar anterior si no es el predeterminado
if ($avatarAnterior && $avatarAnterior !== 'default.jpg') {
    $rutaAnterior = "$directorioDestino/$avatarAnterior";
    if (file_exists($rutaAnterior)) {
        unlink($rutaAnterior);
    }
}

// Guardar nuevo archivo
$rutaFinal = "$directorioDestino/$nombreArchivo";
if (move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
    // URL completa para el frontend
    $urlAvatar = "http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/$nombreArchivo";

    // Actualizar en base de datos (solo el nombre de archivo si prefieres)
    $stmt = $conn->prepare("UPDATE usuarios SET avatar_url = ? WHERE id = ?");
    $stmt->bind_param("ss", $nombreArchivo, $usuarioId);
    $stmt->execute();

    echo json_encode(["success" => true, "avatar" => $urlAvatar]); // DEVUELVE LA URL COMPLETA
} else {
    echo json_encode(["success" => false, "message" => "Error al mover el archivo"]);
}

$conn->close();
