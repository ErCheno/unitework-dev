// auth.js

// Función para guardar el token en localStorage
export function guardarToken(token) {
    localStorage.setItem("token", token);
}

// Función para obtener el token almacenado
export function getToken() {
    return localStorage.getItem("token");
}

// Función para verificar el token en el backend
export async function checkToken() {
    const token = getToken();

    if (!token) {
        console.log("No hay token, redirigiendo al login...");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/checkToken.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.status !== "success") {
            console.log("Token inválido, redirigiendo al login...");
            logoutUser();
        }
    } catch (error) {
        console.error("Error al verificar token:", error);
        logoutUser();
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
