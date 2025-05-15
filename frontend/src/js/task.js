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
                color: null,  // Lo mismo para etiqueta
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

export async function moverTareas(taskId, nuevoEstadoId, nuevaPosicion) {

    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/moveTask.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                tarea_id: taskId,
                estado_id: nuevoEstadoId,
                posicion: nuevaPosicion
            })
        });
        const data = await response.json();
        if (!data.success) {
            console.error('Error:', data.message);
        }
        if (!response.ok) {
            throw new Error(data.message || 'Error desconocido al crear la lista');
        }
        //showToast('Tarea movida', 'success');

        return data;

    } catch (error) {
        console.error('Error al mover las tareas:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}


export async function moverLista(tableroId, nuevaPosicion) {

    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/moveList.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                tablero_id: tableroId,
                posicion: nuevaPosicion
            })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Orden actualizado con éxito');
        } else {
            console.error('Error:', data.message);
        }
        if (!response.ok) {
            throw new Error(data.message || 'Error desconocido al crear la lista');
        }
        //showToast('Tarea movida', 'success');

        return data;

    } catch (error) {
        console.error('Error al mover las tareas:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}


export async function modificarTarea(tarea, inputDescrip = null, inputColor = null) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    const body = {
        id: tarea.id,
        titulo: tarea.titulo,
    };

    if (inputDescrip) body.descripcion = inputDescrip.value;
    if (inputColor) body.color = inputColor.value;

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/putTask.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Error:', data.message);
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error desconocido al modificar la tarea');
        }

        //showToast('Tarea modificada', 'success');
        return data;

    } catch (error) {
        console.error('Error al mover las tareas:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}




export async function deleteTask(tareaId) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/deleteTask.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ tarea_id: tareaId })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Tarea eliminada correctamente');
        } else {
            console.error('Error al eliminar la tarea:', data.message);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}


export async function modificarLista(estadoId, nombre, color) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    // Construimos el body de forma dinámica, solo con los campos que existan
    const body = { id: estadoId };
    if (nombre !== undefined) body.nombre = nombre;
    if (color !== undefined) body.color = color;

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/putList.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Lista modificada correctamente', 'success');
        } else {
            console.error('Error al modificar la lista:', data.message);
        }
        return data;

    } catch (error) {
        console.error('Error en la solicitud:', error);
        showToast('Error en la solicitud: ' + error.message, 'error');
    }
}

export async function deleteList(estadoId, tableroId) {
    const token = getToken(); // Asegúrate de tener esta función definida

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }

    try {
        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/deleteList.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                estado_id: estadoId,
                tablero_id: tableroId
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast("Lista eliminada correctamente", "success");
            return true;
        } else {
            showToast("Error: " + data.message, "error");
            return false;
        }
    } catch (error) {
        console.error("Error al eliminar la lista:", error);
        showToast("Error de red al eliminar la lista", "error");
        return false;
    }
}
