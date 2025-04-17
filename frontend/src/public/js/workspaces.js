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
