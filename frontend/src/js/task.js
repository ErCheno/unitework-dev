import { showToast } from "../../public/js/validator/regex";
import { getToken } from "./auth";

export async function cargarTareasKanban(evt) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }
    const taskId = evt.item.dataset.id;
    const newStatus = evt.to.dataset.status;

    try {
        const response = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/createTasks.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token,
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al actualizar tarea');
        }
    } catch (err) {
        console.error(err);
        showToast('Error al mover tarea: ' + err.message, 'error');
    }
}


export async function crearTarea(nombre, descripcion,) {
    const token = getToken();

    if (!token) {
        showToast("Token no disponible. Inicia sesión nuevamente.", "error");
        page("/login");
        return null;
    }
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/tasksKanban/createTask.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(tarea)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear la tarea');
        }

        showToast('Tarea creada correctamente', 'success');
        return data.id; // si quieres usar el ID de la nueva tarea
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
        return data.id; // id de la nueva lista

    } catch (error) {
        console.error('Error al crear la lista:', error.message);
        showToast('⚠️ ' + error.message, 'error');
    }
}