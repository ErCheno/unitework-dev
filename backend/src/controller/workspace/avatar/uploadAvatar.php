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

// Verificar que los datos hayan sido enviados correctamente
if (!isset($_FILES['avatar']) || !isset($_POST['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$usuarioId = $_POST['usuario_id'];
$archivo = $_FILES['avatar']; // El archivo que se sube

// Verificar que el usuario exista en la base de datos
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
$stmt->bind_param("s", $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "El usuario no existe"]);
    exit;
}
$stmt->close();

// Verificar si el archivo tiene errores
if ($archivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Error al subir el archivo"]);
    exit;
}

// Obtener extensión del archivo y crear un nombre único
$ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombreArchivo = uniqid('avatar_') . '.' . $ext;
$directorioDestino = __DIR__ . "/../../uploads/usuarios";

// Crear directorio si no existe
if (!file_exists($directorioDestino)) {
    mkdir($directorioDestino, 0777, true);
}

// Ruta final donde se guardará la imagen
$rutaFinal = "$directorioDestino/$nombreArchivo";

// Mover el archivo a la carpeta de destino
if (move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
    // Guardar la ruta del archivo en la base de datos
    $stmt = $conn->prepare("UPDATE usuarios SET avatar_url = ? WHERE id = ?");
    $stmt->bind_param("ss", $nombreArchivo, $usuarioId);
    $stmt->execute();

    echo json_encode(["success" => true, "avatar" => $nombreArchivo]);
} else {
    echo json_encode(["success" => false, "message" => "Error al mover el archivo"]);
}

$conn->close();
?>
