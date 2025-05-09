import { showToast } from '../../public/js/validator/regex.js';

export function TaskCard(tarea) {
    const task = document.createElement('div');
    task.className = 'kanban-task';
    task.dataset.id = tarea.id;

    const header = document.createElement('div');
    header.className = 'task-header';

    const title = document.createElement('h3');
    title.textContent = tarea.titulo || 'Sin título';

    const idSpan = document.createElement('span');
    idSpan.textContent = `#${tarea.id}`;
    idSpan.className = 'task-id';

    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = tarea.descripcion || 'Sin descripción';

    const footer = document.createElement('div');
    footer.className = 'task-footer';

    const assigned = document.createElement('span');
    assigned.className = 'task-assigned';
    assigned.textContent = `👤 ${tarea.asignado_a || 'No asignado'}`;

    const editBtn = document.createElement('button');
    editBtn.className = 'task-edit';
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
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
    addBtn.addEventListener('click', async () => {
        const summary = textarea.value.trim();
        if (!summary) return showToast('Debes escribir una descripción');

        const nuevaTarea = { summary, status: 'To Do', boardId };
        const res = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea),
        });

        if (res.ok) {
            textarea.value = '';
            floatingForm.classList.add('hidden');
            createBtn.classList.remove('hidden');
            cargarTareas(boardId);
        } else {
            alert('Error al crear la tarea');
        }
    });

    footer.appendChild(assigned);
    footer.appendChild(editBtn);

    task.appendChild(header);
    task.appendChild(description);

    task.appendChild(footer);
    task.appendChild(floatingForm);
    task.appendChild(createBtn);


    return task;
}
