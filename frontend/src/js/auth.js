import { showToast } from "../../public/js/validator/regex.js";

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Función para establecer el token en localStorage o sessionStorage
export function setToken(token, remember) {
  if (remember) {
    localStorage.setItem("token", token);  // Si "Recordarme" está activado, usamos localStorage
  } else {
    sessionStorage.setItem("token", token);  // Si no, usamos sessionStorage
  }
}

export async function verificarToken(token) {
  if (!token) {
    window.location.href = "/login";

    throw new Error('No hay token');
  }

  try {
    const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/checkToken.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.status === 'success') {
      return result.user; // puedes devolver result.user.id si solo necesitas el ID
    } else {
      window.location.href = "/login";

      throw new Error('Token inválido o expirado');
    }
  } catch (error) {
    console.error('Error al verificar el token:', error);
    throw new Error('Error al verificar el token');
  }
}

// Eliminar el token de ambos almacenamientos y otros datos
export function logoutUser() {
  eliminarToken();
  //disconnectSocket();

  // Eliminar otros posibles datos almacenados
  localStorage.removeItem("avatar_url");
  localStorage.removeItem("usuario_id");
  localStorage.removeItem("usuarioId");
  localStorage.removeItem("username");
  localStorage.removeItem("email");

  window.location.href = "/login";
}

// Eliminar el token sin redireccionar
export function eliminarToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

// Función para verificar si hay un token almacenado
export function isAuthenticated() {
  return !!getToken();  // Retorna true si el token está presente
}


