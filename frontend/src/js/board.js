import page from 'page';
import { showToast } from "../../public/js/validator/regex.js";
import { workspacePage } from '../pages/workspacePage.js';
import { getToken } from './auth.js';

export async function fetchBoards(workspaceId) {
    try {

        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }


        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/getBoard.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                espacio_trabajo_id: workspaceId,
            })
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al obtener los tableros');
        }

        return data.tableros || [];

    } catch (err) {
        console.error(err);
        throw new Error('Error al cargar tableros: ' + err.message);
    }
}



export async function createBoards(nombre, descripcion, espacio_trabajo_id) {



    try {
        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/createBoard.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                espacio_trabajo_id,
                color: getRandomKanbanColor()
            }),
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (data.success) {
            showToast("Tablero creado correctamente", "success");
            // page.redirect(`/workspace/${espacio_trabajo_id}`);
        } else {
            showToast("Error: " + data.message, "error");
        }
    } catch (err) {
        showToast("Error de red o servidor: " + err.message, "error");
        console.error("Error de red o servidor: " + err.message);
    }
}



export async function deleteBoards(tableroId) {
    try {

        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/deleteBoard.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                tablero_id: tableroId,
            })
        });

        const data = await response.json();
        console.log('DELETE Respuesta del backend:', data);

        if (data.success) {
            showToast('Espacio eliminado correctamente', "info");

            const boardElement = document.getElementById(`board-${tableroId}`);
            if (boardElement) {
                boardElement.remove();  // Eliminar la tarjeta del tablero del DOM directamente
            }

        }

    } catch (error) {
        console.error('Error al eliminar el espacio:', error);
        alert('Error en la petición');
    }
}

export async function getUsuariosDisponibles(tableroId, filtro = "") {
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

export async function salirseDelKanban(tableroId) {
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
            body: JSON.stringify({ tablero_id: tableroId })
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

export async function getUsuariosDelTablero(tableroId) {
    try {

        const token = getToken();

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/selectUsersBoard.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera

            },
            body: JSON.stringify({ tablero_id: tableroId })
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

export async function cambiarRolUsuario(tableroId, usuarioId, nuevoRol) {
    try {
        const token = getToken();

        console.log(tableroId);
        console.log(nuevoRol);

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }
        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/updateUserRoleBoard.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera

            },
            body: JSON.stringify({
                tablero_id: tableroId,
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

export async function selectBoard(boardId) {
    try {

        const token = getToken();
        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/selectBoard.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                tableroId: boardId,
            })
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al obtener los tableros');
        }

        return data.tablero;

    } catch (err) {
        console.error(err);
        throw new Error('Error al cargar tableros: ' + err.message);
    }
}

export async function putBoard(boardId, summary = null, description = null) {
    try {
        const token = getToken();
        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            page("/login");
            return;
        }

        const body = {
            tablero_id: boardId
        };

        if (summary !== null) body.nombre = summary;
        if (description !== null) body.descripcion = description;

        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/putBoard.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al modificar el tablero');
        }

        return data;
    } catch (err) {
        console.error(err);
        throw new Error('Error al actualizar tablero: ' + err.message);
    }
}


const KANBAN_COLORS = [
    '#ABE2A5', '#E2C5A5', '#C5A5E2', '#95a9df', '#8fc7e0', '#8dd5dd',
    '#F0E795', '#F0B795', '#E2A5A5', '#E2A5B2', '#E2A5DF'
];

// Función para obtener un color aleatorio
export function getRandomKanbanColor() {
    return KANBAN_COLORS[Math.floor(Math.random() * KANBAN_COLORS.length)];
}
