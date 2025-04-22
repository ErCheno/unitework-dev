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


export async function createWorkspaces(usuarioId, nombre, descripcion, modal) {
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/espaciosTrabajo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                creado_por: usuarioId,
                nombre,
                descripcion,
            }),
        });

        const result = await response.json();

        if (result.success || result.status === true || result.status === "success") {
            showToast("Espacio creado con éxito", "success");
            modal.style.display = 'none';
            modal.remove();

            // Recargar la página de workspaces después de crear el nuevo espacio
            myWorkspacesPage();  // Asegúrate de llamar a la función correcta para cargar los datos de nuevo
        } else {
            showToast(result.message || "Error al crear espacio", "error");
        }
    } catch (err) {
        console.error(err);
        alert('Error en la petición');
    }
}


export async function deleteWorkspaces(usuarioId, espacioTrabajoId) {
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/deleteWorkspaces.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                espacio_trabajo_id: espacioTrabajoId,
                usuario_id: usuarioId
            })
        });

        const data = await response.json();
        console.log('DELETE Respuesta del backend:', data);

        if (data.success) {
            showToast('Espacio eliminado correctamente', "info");

            // Recargar la página de workspaces después de crear el nuevo espacio
            await myWorkspacesPage();  // Asegúrate de llamar a la función correcta para cargar los datos de nuevo
        }
        
    } catch (error) {
        console.error('Error al eliminar el espacio:', error);
        alert('Error en la petición');
    }
}


export async function updateWorkspace(id, usuarioId, nombre, descripcion) {
    try {
        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/putworkspaces.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                usuario_id: usuarioId,
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
