import { showToast } from "./validator/regex";

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
            const card = document.getElementById(`workspace-${espacioTrabajoId}`);
            if (card) card.remove(); // Elimina la tarjeta del DOM si tiene ese id
        }
        
    } catch (error) {
        console.error('Error al eliminar el espacio:', error);
        alert('Error en la petición');
    }
}
