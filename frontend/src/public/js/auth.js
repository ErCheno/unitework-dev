// auth.js

// Función para guardar el token en localStorage

// Función para obtener el token almacenado
export function getToken() {
    return localStorage.getItem("token");
}
export function setToken(token) {
    localStorage.setItem("token", token);
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
    window.location.href = "/login";
}

export function eliminarToken() {
    localStorage.removeItem('token');
}

export function logout() {
    eliminarToken();
    window.location.href = "/login";
}


export function isAuthenticated() {
    return !!getToken();
}
