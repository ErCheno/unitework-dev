import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { TaskCard } from '../components/taskCard.js';
import { cargarTareasKanban, crearEstado } from '../js/task.js';

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
    botonCrear.id = 'crearLista';
    const icoCrear = document.createElement('i');
    icoCrear.className = 'fa-solid fa-plus';
    icoCrear.id = 'icoCrear';
    const parrafoCrear = document.createElement('span');
    parrafoCrear.id = 'parrafoCrear';
    parrafoCrear.textContent = 'Crear lista';
    botonCrear.append(icoCrear, parrafoCrear);

  botonCrear.addEventListener('click', () => {
    botonCrear.style.display = 'none';

    const inputWrapper = document.createElement('div');
    inputWrapper.id = 'input-crear-lista-wrapper';
    inputWrapper.style.display = 'flex';
    inputWrapper.style.gap = '8px';
    inputWrapper.style.alignItems = 'center';

    const inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.placeholder = 'Nombre de la lista';
    inputNombre.className = 'crear-lista-input';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Crear';
    btnConfirmar.className = 'crear-lista-confirmar';

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'crear-lista-cancelar';

    inputWrapper.append(inputNombre, btnConfirmar, btnCancelar);
    botonCrear.parentNode.insertBefore(inputWrapper, botonCrear.nextSibling);

    inputNombre.focus();

    // Cancelar
    function cerrarFormulario() {
        inputWrapper.remove();
        botonCrear.style.display = '';
    }

    btnCancelar.addEventListener('click', cerrarFormulario);

    // Cerrar con Escape o clic fuera
    function handleCerrar(e) {
        if (e.key === 'Escape') cerrarFormulario();
        if (!inputWrapper.contains(e.target) && e.target !== botonCrear) {
            cerrarFormulario();
            document.removeEventListener('click', handleCerrar);
        }
    }

    setTimeout(() => document.addEventListener('click', handleCerrar)); // evitar cerrar por el mismo click

    inputNombre.addEventListener('keydown', e => {
        if (e.key === 'Enter') btnConfirmar.click();
    });

    // Confirmar creación
    btnConfirmar.addEventListener('click', async () => {
        const nombre = inputNombre.value.trim();
        if (!nombre) return showToast('⚠️ Escribe un nombre válido');

        const nuevoId = await crearEstado(nombre, boardId);
        if (nuevoId) {
            showToast('✅ Lista creada');
            cerrarFormulario();
        }
    });
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

    divConjuntoArriba.append(title, botonVolver);
    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';



    // Contenedor Kanban
    const kanbanContainer = document.createElement('div');
    kanbanContainer.id = 'kanban-list';


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
        kanbanContainer.appendChild(botonCrear);
        columnasDOM[col] = colContent;
    });

    async function cargarTareas(boardId) {
        cargarTareasKanban();
        let tareas = [];


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

    container.append(divConjuntoArriba, hrWorkspaces, kanbanContainer);
    contentDiv.appendChild(container);

    cargarTareas(boardId);

    // Activar drag and drop
    setupSortable('kanban-list', '.workspace-draggable', async (evt) => {
        cargarTareasKanban();
        if (!response.ok) {
            showToast('Error al mover la tarea');
            cargarTareas(boardId); // revertir cambios visuales si falla
        }
    });


    scrollHorizontal(kanbanContainer);

    return container;
}
