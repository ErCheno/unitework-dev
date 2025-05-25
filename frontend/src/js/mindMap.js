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
            throw new Error(data.message || 'Error desconocido al obtener los tableros');
        }

        return data.mapas_mentales || [];

    } catch (error) {
        console.error(error);

        throw new Error('Error al cargar mapas mentales: ' + error.message);
    }
}
export async function createMindMap(titulo, descripcion, espacioTrabajoId) {

    const bodyData = {
        titulo,
        espacio_trabajo_id: espacioTrabajoId,
        color: getRandomMapColor()
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

export async function modificarMindMap(mapaId, titulo, descripcion) {
    try {
        const token = getToken(); // función que recupera el token (ajusta según tu implementación)

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const payload = {
            mapa_id: mapaId,
        };
        if (titulo !== undefined) payload.titulo = titulo;
        if (descripcion !== undefined) payload.descripcion = descripcion;

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/putMindMap.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Error al actualizar el nodo");
        }

        if (data.success) {
            console.log('Mapa mental actualizado con éxito:', data.message);
        } else {
            console.error('Error al actualizar mapa mental:', data.message);
        }

        return data;
    } catch (error) {
        console.error("Error al actualizar nodo:", error);
        showToast("Error al actualizar nodo: " + error.message, "error");
        return null;
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



export async function fetchNodos(mapaId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/getNodos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ mapa_id: mapaId })

        });

        if (!response.ok) {
            throw new Error('Error en la respuesta: ' + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Error del servidor:', data.message);
            return null;
        }

        return data.nodos_mapa; // Devuelve el array para que lo uses como necesites

    } catch (error) {
        console.error('Error al obtener mapas mentales:', error);
        return null;
    }
}
export async function crearNodo(mapaId, contenidoNuevo, padreId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const body = {
            mapa_id: mapaId,
            contenido: contenidoNuevo
        };
        if (padreId !== null) {
            body.padre_id = padreId;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/createNodo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear el nodo');
        }

        // Retornamos el nodo creado (según la respuesta del backend)
        return data;

    } catch (error) {
        console.error('Error al crear nodo:', error);
        return null;
    }
}

export async function deleteNodo(nodoId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/deleteNodo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token

            },
            body: JSON.stringify({ nodo_id: nodoId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al eliminar el mapa mental');
        }

    } catch (error) {
        console.error('Error en createMindMap:', error);
        throw error;
    }
}

export async function getNodoPadre(mapaId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/getNodoPadre.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({ mapa_id: mapaId }),
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta: ' + response.status);
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Error del servidor:', data.message);
            return null;
        }

        return data.nodoRaiz;

    } catch (error) {
        console.error('Error al obtener nodo padre:', error);
        return null;
    }
}


export async function fetchCrearPadre(mapaId, topic, hijoId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/createPadre.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ mapa_id: mapaId, topic, hijo_id: hijoId })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear el nodo');
        }

        // Devuelve solo el nodo creado
        return data.nodo;

    } catch (error) {
        console.error('Error al crear nodo:', error);
        return null;
    }
}


export async function fetchActualizarNodo(nodoId, nuevoContenido) {
    try {
        const token = getToken(); // función que recupera el token (ajusta según tu implementación)

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/putNodo.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify({ nodo_id: nodoId, contenido: nuevoContenido }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Error al actualizar el nodo");
        }

        return data;
    } catch (error) {
        console.error("Error al actualizar nodo:", error);
        showToast("Error al actualizar nodo: " + error.message, "error");
        return null;
    }
}



export async function actualizarPadresLote(nodos) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return null;
        }

        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/moverNodo.php`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify({ nodos })
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Error en respuesta backend:', data);
            showToast('Algunos nodos no se actualizaron', 'error');
        } else {
            showToast('Nodos actualizados correctamente', 'success');
        }

        return data;

    } catch (error) {
        console.error('Error en la petición:', error);
        showToast('Error en la petición al servidor', 'error');
        return null;
    }
}


export async function getUsuariosDelMapa(mapaId) {
    try {

        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/selectUsersMindMap.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera

            },
            body: JSON.stringify({ mapa_id: mapaId })
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


export async function getUsuariosDisponiblesInvitacionMapa(tableroId, filtro = "") {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/selectUsers.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera

            },
            body: JSON.stringify({ tablero_id: tableroId, filtro })
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

export async function salirseDelMindMap(mapaId) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/salirKanban.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ mapa_id: mapaId })
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Error desconocido");
        showToast('Te saliste del kanban', 'info');
        return data;
    } catch (error) {
        console.error("Error al salir del tablero Kanban:", error.message);
        showToast(error.message || "No se pudo salir del tablero", "error");
        return null;
    }
}



export async function cambiarRolUsuarioMapa(mapaId, usuarioId, nuevoRol) {
    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }
                const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/mindMap/updateUserRoleMindMap.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                mapa_id: mapaId,
                usuario_id: usuarioId,
                nuevo_rol: nuevoRol
            })
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


const MINDMAP_COLORS = [
    '#ABE2A5', '#E2C5A5', '#C5A5E2', '#95a9df', '#8fc7e0', '#8dd5dd',
    '#F0E795', '#F0B795', '#E2A5A5', '#E2A5B2', '#E2A5DF'
];

// Función para obtener un color aleatorio
export function getRandomMapColor() {
    return MINDMAP_COLORS[Math.floor(Math.random() * MINDMAP_COLORS.length)];
}
