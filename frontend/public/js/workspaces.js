import { showToast } from "../js/validator/regex";
import { myWorkspacesPage } from "../../src/pages/myworkspacesPage.js";

export async function fetchWorkspaces(usuarioId) {
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/getWorkspaces.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                creado_por: usuarioId
            }),        
        });

        const data = await response.json();
        console.log('Respuesta del backend:', data);

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al obtener los workspaces');
        }

        return data.workspaces || [];
    } catch (error) {
        console.error('Error al obtener los workspaces:', error);
        throw error;
    }
}


export async function createWorkspaces(nombre, descripcion, modal) {
    try {
        const token = localStorage.getItem('token'); // Asegúrate de que el token esté guardado al iniciar sesión
        console.log(token);
        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
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
        } else {
            showToast(result.message || "Error al crear espacio", "error"); // En caso de error
        }
    } catch (err) {
        console.error(err);
        alert('Error en la petición'); // Mostrar un alert si ocurre un error
    }
}



export async function deleteWorkspaces(espacioTrabajoId) {
    try {
        const token = localStorage.getItem('token'); // Asegúrate de tener el token guardado al iniciar sesión

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
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


export async function updateWorkspace(nombre, descripcion, espacioTrabajoId) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
        }

        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/putWorkspaces.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                id: espacioTrabajoId,
                nombre,
                descripcion
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Espacio actualizado correctamente', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast('Error al actualizar: ' + data.message, 'error');
            console.error(data.message);
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
        console.error('Error en updateWorkspace:', error);
    }
}
