import { showToast } from "../../public/js/validator/regex";
import { getToken } from "./auth";

export async function getTareas(estado, boardId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    try {
        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/getTasks.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token,
            },
            body: JSON.stringify({ estado_id: estado.id, tablero_id: boardId })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al mover tarea');
        }

        // Mostrar un mensaje de éxito
        return data;
    } catch (err) {
        console.error(err);
        showToast('Error al mover tarea: ' + err.message, 'error');
    }
}


export async function crearTarea(estado, titulo, boardId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return;
    }

    try {
        const dataToSend = {
            tablero_id: boardId,
            estado_id: estado.id,
            titulo: titulo,
            descripcion: null,  // Puedes incluir la descripción aquí si es necesario
            fecha_limite: null,  // Lo mismo para fecha_limite
            orden: null,  // El orden se calculará en el backend
            prioridad: 'media',  // O cualquier valor por defecto
            etiqueta: null,  // Lo mismo para etiqueta
            asignado_a: null  // O el ID del usuario asignado
        };

        console.log('Datos a enviar:', dataToSend);

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/createTask.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                tablero_id: boardId,
                estado_id: estado.id,
                titulo: titulo,
                descripcion: null,  // Puedes incluir la descripción aquí si es necesario
                fecha_limite: null,  // Lo mismo para fecha_limite
                orden: null,  // El orden se calculará en el backend
                prioridad: 'media',  // O cualquier valor por defecto
                etiqueta: null,  // Lo mismo para etiqueta
                asignado_a: null  // O el ID del usuario asignado
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear la tarea');
        }

        showToast('Tarea creada correctamente', 'success');
        return data;  // Aquí puedes usar el ID de la nueva tarea si lo necesitas
    } catch (error) {
        console.error(error);
        showToast(error.message, 'error');
    }
}


export async function crearEstado(nombre, tableroId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/createList.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ nombre, tablero_id: tableroId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error desconocido al crear la lista');
        }

        showToast('Lista creada correctamente ✅', 'success');
        return data;

    } catch (error) {
        console.error('Error al crear la lista:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}

export async function getEstado(tableroId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/getList.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ tablero_id: tableroId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error desconocido al crear la lista');
        }

        return data;

    } catch (error) {
        console.error('Error al crear la lista:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}