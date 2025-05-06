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

    header.appendChild(title);
    header.appendChild(idSpan);

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

    footer.appendChild(assigned);
    footer.appendChild(editBtn);

    task.appendChild(header);
    task.appendChild(description);
    task.appendChild(footer);

    return task;
}
