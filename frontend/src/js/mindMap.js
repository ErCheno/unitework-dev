import { showToast } from "../../public/js/validator/regex";
import { getToken } from "./auth";

export async function fetchMindMaps(espacioTrabajoId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/getMindMaps.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                espacio_trabajo_id: espacioTrabajoId,
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta: ' + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Error del servidor:', data.message);
            return null;
        }

        return data.mapas_mentales || [];

    } catch (error) {
        console.error('Error al obtener mapas mentales:', error);
        return null;
    }
}
export async function createMindMap(titulo, descripcion, espacioTrabajoId) {

    const bodyData = {
        titulo,
        espacio_trabajo_id: espacioTrabajoId,
    };

    if (descripcion && descripcion.trim() !== '') {
        bodyData.descripcion = descripcion;
    }

    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/createMindMap.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token

            },
            body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear el mapa mental');
        }



    } catch (error) {
        console.error('Error en createMindMap:', error);
        throw error;
    }
}

export async function deleteMindMap(mapaMentalId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/deleteMindMap.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token

            },
            body: JSON.stringify({ mapa_mental_id: mapaMentalId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al eliminar el mapa mental');
        }
        if (data.success) {
            showToast('Espacio eliminado correctamente', "info");

            const mindmapElement = document.getElementById(`mindmap-${mapaMentalId}`);
            if (mindmapElement) {
                mindmapElement.remove();  // Eliminar la tarjeta del tablero del DOM directamente
            }

        }
    } catch (error) {
        console.error('Error en createMindMap:', error);
        throw error;
    }
}

export async function selectMindMap(mindmapId) {
    try {

        const token = getToken();
        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/selectMindMap.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({ mindmapId }),

        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al obtener el mapa mental');
        }

        return data.mindmap;

    } catch (err) {
        console.error(err);
        throw new Error('Error al cargar tableros: ' + err.message);
    }
}
