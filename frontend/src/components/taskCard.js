import { showToast } from '../../public/js/validator/regex.js';
import { crearTarea, getTareas } from '../js/task.js';
import { fetchAndRenderList, fetchAndRenderTasks } from '../pages/boardPage.js';

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


    const createBtn = document.createElement('button');
    createBtn.classList.add('create-task-btn');

    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-plus');

    const btnText = document.createElement('span');
    btnText.textContent = 'Crear tarea';

    createBtn.appendChild(icon);
    createBtn.appendChild(btnText);

    // Crear contenedor de formulario
    const floatingForm = document.createElement('div');
    floatingForm.className = 'floating-task-form hidden';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Escribe la descripción de la tarea...';

    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'add-task-confirm';
    addBtn.textContent = 'Crear';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-task';
    cancelBtn.textContent = 'Cancelar';

    actions.append(addBtn, cancelBtn);
    floatingForm.append(textarea, actions);

    // Insertar en el contenedor principal

    // Mostrar formulario
    createBtn.addEventListener('click', () => {
        createBtn.classList.add('hidden');
        floatingForm.classList.remove('hidden');
        textarea.focus();
    });

    // Cancelar creación
    cancelBtn.addEventListener('click', () => {
        textarea.value = '';
        floatingForm.classList.add('hidden');
        createBtn.classList.remove('hidden');
    });

    // Confirmar creación

    addBtn.addEventListener('click', () => {
        const summary = textarea.value.trim();
        if (!summary) return showToast('Debes escribir un nombre');

        // Llamamos a crearTarea con el estado.id y el nombre de la tarea
        crearTarea(estado, summary, boardId);
        fetchAndRenderTasks(estado, boardId);


        textarea.value = '';
        floatingForm.classList.add('hidden');
        createBtn.classList.remove('hidden');

    });

    //footer.appendChild(assigned);
    //footer.appendChild(editBtn);

    //task.appendChild(header);
    //task.appendChild(description);
    console.log(boardId);
    fetchAndRenderTasks(estado, boardId);

    task.appendChild(footer);
    task.appendChild(floatingForm);
    task.appendChild(createBtn);


    return task;
}

export async function cargarTareas(estado) {
    try {
        console.log(estado);
        console.log(estado.id);
        console.log(estado.tablero_id);

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