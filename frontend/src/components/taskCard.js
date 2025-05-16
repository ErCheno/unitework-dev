import { showToast } from '../../public/js/validator/regex.js';
import { crearTarea, getTareas } from '../js/task.js';
import { fetchAndRenderList, fetchAndRenderTasks } from '../pages/boardPage.js';
import { socket } from '../js/socket.js';
export function TaskCard(estado, boardId) {
    const task = document.createElement('div');
    task.className = 'kanban-task';
    task.dataset.id = estado.id;

    const header = document.createElement('div');
    header.className = 'task-header';

    const title = document.createElement('h3');
    title.textContent = estado.titulo || 'Sin título';

    const idSpan = document.createElement('span');
    idSpan.textContent = `#${estado.id}`;
    idSpan.className = 'task-id';

    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = estado.descripcion || 'Sin descripción';

    const footer = document.createElement('div');
    footer.className = 'task-footer';

    const assigned = document.createElement('span');
    assigned.className = 'task-assigned';
    assigned.textContent = `👤 ${estado.asignado_a || 'No asignado'}`;

    const editBtn = document.createElement('button');
    editBtn.className = 'task-edit';
    editBtn.classList.add = 'fa-solid fa-pen-to-square';
    editBtn.title = 'Editar tarea';
    // Formulario para nueva tarea
    const form = document.createElement('form');
    form.id = 'add-task-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'task-summary';
    input.placeholder = 'Descripción de la tarea';
    input.required = true;

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Agregar Tarea';

    //footer.appendChild(assigned);
    //footer.appendChild(editBtn);

    //task.appendChild(header);
    //task.appendChild(description);
    fetchAndRenderTasks(estado, boardId);

    task.appendChild(footer);


    return task;
}

export async function cargarTareas(estado) {
    try {
        const tareas = await getTareas(estado.id, estado.tablero_id); // Obtenemos las tareas del backend
        console.log(tareas);
        if (!tareas || tareas.length === 0) {
            showToast('⚠️ No hay tareas en este tablero');
            return;
        }
    } catch (err) {
        console.error('Error al cargar tareas:', err);
        showToast('⚠️ Error al cargar tareas', 'error');
    }
}

