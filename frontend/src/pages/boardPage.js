import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable, setupSortableKanban, setupSortableList } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { cargarTareas, TaskCard } from '../components/taskCard.js';
import { getTareas, crearEstado, getEstado } from '../js/task.js';

export function BoardPage(boardId) {
    cleanupView();

    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }
    contentDiv.textContent = '';

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
        popupCrearLista(botonCrear, boardId);

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
    //botonVolver.addEventListener('click', () => page(`/workspace/${workspace.id}`));

    const divBotonesArriba = document.createElement('div');
    divBotonesArriba.id = 'divBotonesArriba';

    divBotonesArriba.appendChild(botonCrear);
    divBotonesArriba.appendChild(botonVolver);

    divConjuntoArriba.append(title, divBotonesArriba);
    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';



    // Contenedor Kanban
    const kanbanContainer = document.createElement('div');
    kanbanContainer.id = 'kanban-list';


    (async () => {
        await fetchAndRenderList(boardId);




        // Reordenar columnas (listas)
        setupSortableList('#kanban-list', '.kanban-column', async (evt) => {
            const columnas = Array.from(document.querySelectorAll('.kanban-column'));
            const nuevoOrden = columnas.map((col, index) => ({
                id: col.dataset.estadoId,
                orden: index
            }));

            try {
                await fetch('/api/ordenar-listas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orden: nuevoOrden })
                });
            } catch (err) {
                console.error('Error al reordenar columnas:', err);
                showToast('No se pudo guardar el nuevo orden');
            }
        });
    })();


    scrollHorizontal(kanbanContainer);

    container.append(divConjuntoArriba, hrWorkspaces, kanbanContainer);
    contentDiv.appendChild(container);

    return container;
}


export async function fetchAndRenderList(boardId) {
    try {
        const respuesta = await getEstado(boardId);
        const estados = respuesta.listas || [];

        const grid = document.getElementById('kanban-list');
        grid.textContent = '';  // ⚠️ Esto borra todo, incluyendo el botón

        if (estados.length === 0) {
            const noBoardsMsg = document.createElement('p');
            noBoardsMsg.textContent = '¡Empieza creando un proyecto!';
            noBoardsMsg.classList.add('no-workspaces-msg');
            grid.appendChild(noBoardsMsg);
        } else {
            estados.forEach(estado => {
                const columna = document.createElement("div");
                columna.classList.add("kanban-column", "column-draggable");
                columna.dataset.estadoId = estado.id;

                const titulo = document.createElement("h3");
                titulo.textContent = estado.nombre;

                const listaTareas = document.createElement("div");
                listaTareas.classList.add("kanban-column-content");

                if (estado.tareas && estado.tareas.length > 0) {
                    fetchAndRenderTasks(estado);
                }

                columna.appendChild(titulo);
                columna.appendChild(listaTareas);
                listaTareas.appendChild(TaskCard(estado, boardId));
                grid.appendChild(columna);
            });
        }


    } catch (err) {
        console.error('Error al recargar los tableros:', err);
    }
}



// Función para renderizar las tareas dentro de cada columna (estado)
export async function fetchAndRenderTasks(estado) {
    try {
        const response = await getTareas(estado, estado.tablero_id);
        const tareas = response.tasks;

        const columna = document.querySelector(`.kanban-column[data-estado-id="${estado.id}"]`);
        const listaTareas = columna.querySelector(".kanban-column-content");
        const botonCrear = listaTareas.querySelector('.create-task-btn');

        // ✅ Elimina solo las tareas previas, deja el botón
        listaTareas.querySelectorAll('.task-draggable').forEach(t => t.remove());

        tareas.forEach(tarea => {
            const tareaElemento = document.createElement("div");
            tareaElemento.classList.add("task-draggable");
            tareaElemento.dataset.tareaId = tarea.id;

            const tareaTitulo = document.createElement("p");
            tareaTitulo.textContent = tarea.titulo;
            tareaElemento.appendChild(tareaTitulo);
            listaTareas.appendChild(tareaElemento); // fallback si no hay botón
            tareaElemento.addEventListener('click', () => {
                console.log('Tarea clickeada:', tarea);
            });
        });



        // ✅ Inicializa solo si se renderizó alguna tarea
        setupSortableKanban('#kanban-list', '.kanban-column-content', async (evt) => {
            const tarea = evt.item;
            const tareaId = tarea.dataset.tareaId;

            const columnas = Array.from(document.querySelectorAll('.kanban-column-content'));
            const nuevoOrden = columnas.map(col => ({
                id: col.dataset.estadoId,
                orden: Array.from(col.querySelectorAll('.task-draggable')).map((task, idx) => ({
                    tareaId: task.dataset.tareaId,
                    orden: idx
                }))
            }));

            try {
                const response = await fetch('/api/mover-tarea', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tareaId, nuevoOrden })
                });

                if (!response.ok) {
                    showToast('Error al mover la tarea');
                }
            } catch (err) {
                console.error(err);
                showToast('Error de red');
            }
        });

    } catch (error) {
        console.error("Error al cargar las tareas:", error);
    }
}


function popupCrearLista(botonCrear, boardId) {
    // Si ya existe un popup, lo eliminamos antes de crear uno nuevo
    const popupPrevio = document.getElementById('popupCrearLista');
    if (popupPrevio) {
        popupPrevio.remove();
    }


    const popup = document.createElement('div');
    popup.className = 'listCreate-popup animate-popup';
    popup.id = 'popupCrearLista';
    popup.classList.add('fade-in');

    const arrow = document.createElement('div');
    arrow.className = 'popup-arrow-create-List';

    const title = document.createElement('h3');
    title.id = 'tittle-new-board';
    title.textContent = 'Crear nueva lista';

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    const label = document.createElement('label');
    label.textContent = 'Nombre de la lista';

    const inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.placeholder = 'Nombre de la lista';

    const divBotones = document.createElement('div');
    divBotones.id = 'divBotones';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Crear';
    btnConfirmar.className = 'crear-lista-confirmar';

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'crear-lista-cancelar';

    divBotones.appendChild(btnConfirmar);
    divBotones.appendChild(btnCancelar);

    inputGroup.append(label, inputNombre);
    popup.append(arrow, title, inputGroup, divBotones);

    document.body.appendChild(popup);

    // Posicionar el popup justo debajo del botón, alineado a la izquierda
    const rect = botonCrear.getBoundingClientRect();
    const popupWidth = 300; // mismo ancho que el CSS .board-popup

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 8; // espacio entre botón y popup

    // Si el popup se desborda a la derecha, lo ajustamos
    if (left + popupWidth > window.innerWidth - 10) {
        left = window.innerWidth - popupWidth - 10;
    }

    popup.style.position = 'fixed';
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    inputNombre.focus();

    // Cerrar y limpiar
    function cerrarPopup() {
        popup.classList.remove('fade-in');
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 200);  // esperar animación
        botonCrear.style.display = '';
        document.removeEventListener('click', handleCerrar);
    }

    btnCancelar.addEventListener('click', cerrarPopup);

    function handleCerrar(e) {
        if (e.key === 'Escape') cerrarPopup();
        if (!popup.contains(e.target) && e.target !== botonCrear) {
            cerrarPopup();
        }
    }

    setTimeout(() => document.addEventListener('click', handleCerrar));

    inputNombre.addEventListener('keydown', e => {
        if (e.key === 'Enter') btnConfirmar.click();
    });

    // Confirmar
    btnConfirmar.addEventListener('click', async () => {
        const nombre = inputNombre.value.trim();
        if (!nombre) return showToast('⚠️ Escribe un nombre válido');
        try {
            const nuevoId = await crearEstado(nombre, boardId);
            if (nuevoId) {
                showToast('✅ Lista creada');
                fetchAndRenderList(boardId);
                cerrarPopup();
            }
        } catch (err) {
            console.error(err);
        }
    });
}
