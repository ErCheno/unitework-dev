// auth.js

// Función para guardar el token en localStorage

// Función para obtener el token almacenado
// Función para obtener el token desde localStorage o sessionStorage
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



// Función para verificar el token en el backend
export async function checkToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("No hay token, redirigiendo al login...");
        return false;  // No hay token, no se puede verificar

    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/checkToken.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',

            },

        });

        const result = await response.json();
        console.log(result);  // Verifica la respuesta del servidor

        if (result.status === 'success') {
            console.log("Token válido:", result.user);  // El token es válido
            

            return result.user;  // Devolver los datos del usuario si el token es válido
        } else {
            console.log("Token no válido o expirado:", result.message);
            return false;  // Token no válido o expirado
        }
    } catch (error) {
        console.error("Error al verificar token:", error);
        return false;  // Error al verificar el token

        //logoutUser();
    }
}

// Función para cerrar sesión
export function logoutUser() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";  // Redirige al login
}

export function eliminarToken() {
    localStorage.removeItem('token');
}
// Función para verificar si hay un token almacenado
export function isAuthenticated() {
    return !!getToken();  // Retorna true si el token está presente
}


