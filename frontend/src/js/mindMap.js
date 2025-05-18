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
