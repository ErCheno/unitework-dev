import { showToast } from "../../public/js/validator/regex.js";
import { myWorkspacesPage } from "../pages/myworkspacesPage.js";
import { getToken, logoutUser } from "./auth.js";
import page from 'page';

export async function fetchWorkspaces(orden = 'nombre_asc') {
    const token = getToken();
    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }
    try {
        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/getWorkspaces.php?orden=${orden}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al obtener workspaces');
        }

        return data.workspaces || [];
    } catch (error) {
        console.error('Error al obtener los workspaces:', error);
        throw error;
    }
}


export async function createWorkspaces(nombre, descripcion, modal) {
    try {
        const token = getToken(); // Asegúrate de que el token esté guardado al iniciar sesión
        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/espaciosTrabajo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envías el token aquí
            },
            body: JSON.stringify({
                nombre, // Pasas el nombre
                descripcion // Pasas la descripción
            }),
        });

        const result = await response.json(); // Esperas la respuesta del backend

        if (result.status === true || result.status === "success") {
            // Verificas si el resultado es exitoso
            showToast("Espacio creado con éxito", "success");
            modal.style.display = 'none';
            modal.remove();

            myWorkspacesPage(); // Recargar los espacios de trabajo
            return result.workspace_id; // ← ¡Esto es clave! Devuelves el nuevo workspace
        } else {
            showToast(result.message || "Error al crear espacio", "error"); // En caso de error
            return null;

        }
    } catch (err) {
        console.error(err);
        alert('Error en la petición'); // Mostrar un alert si ocurre un error
        return null;

    }
}



export async function deleteWorkspaces(espacioTrabajoId) {
    try {
        const token = getToken(); // Asegúrate de tener el token guardado al iniciar sesión

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        // Datos a enviar
        const data = {
            espacio_trabajo_id: espacioTrabajoId
        };

        // Petición DELETE
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/deleteWorkspaces.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Manejo de respuesta
        if (result.success) {  // Cambiado de result.status a result.success
            showToast(result.message, "success");
            await myWorkspacesPage();  // Asegúrate de llamar a la función correcta para cargar los datos de nuevo
        } else {
            showToast(result.message, "error");
        }
    } catch (err) {
        console.error(err);
        showToast('Error en la petición', "error");
    }
}

export async function salirseDelWorkspace(espacioTrabajoId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        logoutUser();
        return;
    }

    try {


        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/salirWorkspace.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ espacio_trabajo_id: espacioTrabajoId })
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Error desconocido");

        showToast("Saliste del espacio de trabajo correctamente", "info");
        return data;
    } catch (error) {
        console.error("Error al salir del espacio de trabajo:", error.message);
        showToast(error.message || "No se pudo salir del espacio de trabajo", "error");
        return null;
    }
}



export async function updateWorkspace(nombre, descripcion, espacioTrabajoId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        // Construir el cuerpo dinámicamente
        const payload = {
            id: espacioTrabajoId,
            nombre
        };

        if (descripcion && descripcion.trim() !== "") {
            payload.descripcion = descripcion.trim();
        }

        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/putWorkspaces.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Espacio actualizado correctamente', 'success');
        } else {
            showToast('Error al actualizar: ' + data.message, 'error');
            console.error(data.message);
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
        console.error('Error en updateWorkspace:', error);
    }
}



export async function getUsuariosDisponiblesWorkspace(workspaceId, filtro = "") {
    try {

        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/selectUsersWorkspace.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ espacio_trabajo_id: workspaceId, filtro })
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Error desconocido");

        return data.usuarios_disponibles;
    } catch (error) {
        console.error("Error al obtener usuarios disponibles:", error.message);
        return [];
    }
}
