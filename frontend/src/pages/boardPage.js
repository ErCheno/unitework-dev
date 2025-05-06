import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable } from '../components/dragAnimation';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { TaskCard } from '../components/taskCard.js';

export function BoardPage(boardId) {
    cleanupView();

    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }
    contentDiv.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'container';

    const navbar = Navbar();
    const topbar = TopNavbar();

    container.appendChild(navbar);
    container.appendChild(topbar);

    // Sección superior
    const divConjuntoArriba = document.createElement('div');
    divConjuntoArriba.id = 'divConjuntoArriba';

    const title = document.createElement('h1');
    title.id = 'tituloKanban';
    title.textContent = 'Tareas';

    const botonCrear = document.createElement('button');
    botonCrear.id = 'crearTarea';
    const icoCrear = document.createElement('i');
    icoCrear.className = 'fa-solid fa-square-plus';
    icoCrear.id = 'icoCrear';
    const parrafoCrear = document.createElement('p');
    parrafoCrear.id = 'parrafoCrear';
    parrafoCrear.textContent = 'Crear tarea';
    botonCrear.append(icoCrear, parrafoCrear);

    botonCrear.addEventListener('click', () => {
        // Aquí puedes abrir un modal personalizado
    });

    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolver';
    const icoVolver = document.createElement('i');
    icoVolver.className = 'fa-solid fa-chevron-left';
    icoVolver.id = 'icoVolver';
    const parrafoVolver = document.createElement('p');
    parrafoVolver.id = 'parrafoVolver';
    parrafoVolver.textContent = 'Volver';
    botonVolver.append(icoVolver, parrafoVolver);

    botonVolver.addEventListener('click', () => page('/myworkspaces'));

    divConjuntoArriba.append(title, botonCrear, botonVolver);
    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';

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

    form.append(input, button);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const summary = input.value.trim();
        const newTask = { summary, status: 'To Do', boardId };

        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });

        if (response.ok) {
            input.value = '';
            cargarTareas(boardId);
        } else {
            alert('Error al agregar la tarea');
        }
    });

    // Contenedor Kanban
    const kanbanContainer = document.createElement('div');
    kanbanContainer.id = 'kanbanContainer';
    kanbanContainer.style.display = 'flex';
    kanbanContainer.style.gap = '16px';
    kanbanContainer.style.overflowX = 'auto';

    const columnas = ['To Do', 'In Progress', 'Done'];
    const columnasDOM = {};

    columnas.forEach(col => {
        const colDiv = document.createElement('div');
        colDiv.className = 'kanban-column';
        colDiv.dataset.status = col;

        const colTitle = document.createElement('h3');
        colTitle.textContent = col;

        const colContent = document.createElement('div');
        colContent.className = 'kanban-column-content workspace-draggable';
        colContent.dataset.status = col;

        colDiv.append(colTitle, colContent);
        kanbanContainer.appendChild(colDiv);
        columnasDOM[col] = colContent;
    });

    async function cargarTareas(boardId) {
        const response = await fetch(`/api/tareas/${boardId}`);
        let tareas = [];

        if (response.ok) {
            tareas = await response.json();
        }

        // Si no hay tareas, añadimos 3 de ejemplo para pruebas visuales
        if (tareas.length === 0) {
            tareas = [
                { id: 1, summary: 'Diseñar wireframes', status: 'To Do', boardId },
                { id: 2, summary: 'Conectar API de usuarios', status: 'In Progress', boardId },
                { id: 3, summary: 'Subir app a producción', status: 'Done', boardId }
            ];
        }

        // Limpiar columnas
        Object.values(columnasDOM).forEach(col => (col.innerHTML = ''));

        tareas.forEach(tarea => {
            const taskElement = TaskCard(tarea);
            const targetCol = columnasDOM[tarea.status] || columnasDOM['To Do'];
            targetCol.appendChild(taskElement);
        });
    }

    container.append(divConjuntoArriba, hrWorkspaces, form, kanbanContainer);
    contentDiv.appendChild(container);

    cargarTareas(boardId);

    // Activar drag and drop
    setupSortable('kanbanContainer', '.workspace-draggable', (evt) => {
        console.log('Tarea movida de', evt.oldIndex, 'a', evt.newIndex);
    });

    scrollHorizontal(kanbanContainer);

    return container;
}
