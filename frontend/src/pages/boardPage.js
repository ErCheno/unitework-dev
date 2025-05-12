import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable, setupSortableKanban, setupSortableList } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { cargarTareas, TaskCard } from '../components/taskCard.js';
import { getTareas, crearEstado, getEstado, crearTarea, moverTareas, moverLista } from '../js/task.js';

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
        // Renderizar la lista inicialmente
        await fetchAndRenderList(boardId);

        // Reordenar columnas (listas)
        setupSortableList('#kanban-list', async (evt) => {

            // Recolectar las columnas en el orden actualizado
            const columnas = Array.from(document.querySelectorAll('.kanban-column'));
            const nuevoOrden = columnas.map((col, index) => ({
                listaId: parseInt(col.dataset.estadoId),
                posicionamiento: index
            }));

            console.log(columnas);
            console.log(nuevoOrden.map(item => item.listaId));

            // Actualizar el orden en la base de datos
            try {
                const response = await moverLista(boardId, nuevoOrden);
                if (response && response.success) {
                    console.log('Orden actualizado correctamente en el backend');

                    // Reordenar las columnas visualmente en el DOM después de la actualización
                    const parent = document.querySelector('#kanban-list');
                    const columnasOrdenadas = nuevoOrden.map(item =>
                        document.querySelector(`[data-estado-id="${item.listaId}"]`)
                    );

                    columnasOrdenadas.forEach(columna => {
                        if (columna) {
                            parent.appendChild(columna); // Mueve las columnas al nuevo orden
                        }
                    });


                    // Volver a renderizar la lista después de mover las columnas
                } else {
                    console.error('Error al mover las columnas', response.message);
                    showToast('Error al mover columnas. Intenta nuevamente.', 'error');
                }
            } catch (error) {
                console.error('Error al actualizar el orden en la base de datos', error);
                showToast('Error al mover columnas. Intenta nuevamente.', 'error');
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

                const divHeader = document.createElement('div');
                divHeader.className = 'task-header';

                const menuContainer = document.createElement('div');
                const titulo = document.createElement("h3");
                menuContainer.id = 'menu-container';

                const icoTask = document.createElement('i');
                icoTask.className = 'fa-solid fa-ellipsis';
                icoTask.id = 'icoTask';

                const menu = document.createElement('ul');
                menu.className = 'task-menu hidden';

                const detalle = document.createElement('li');
                detalle.textContent = 'Ver detalles';

                const invitar = document.createElement('li');
                invitar.textContent = 'Invitar usuarios';

                const salir = document.createElement('li');
                salir.textContent = 'Salir del espacio';

                const eliminar = document.createElement('li');
                eliminar.textContent = 'Eliminar espacio';
                eliminar.id = 'eliminarLi';

                menu.appendChild(detalle);
                menu.appendChild(salir);
                menu.appendChild(invitar);
                menu.appendChild(eliminar);

                titulo.textContent = estado.nombre;

                const listaTareas = document.createElement("div");
                listaTareas.classList.add("kanban-column-content");

                if (estado.tareas && estado.tareas.length > 0) {
                    fetchAndRenderTasks(estado);
                }

                menuContainer.appendChild(menu);

                menuContainer.appendChild(icoTask);

                divHeader.appendChild(titulo);
                divHeader.appendChild(menuContainer);
                columna.appendChild(divHeader)
                columna.appendChild(listaTareas);
                listaTareas.appendChild(TaskCard(estado, boardId));


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

                columna.appendChild(createBtn);
                columna.appendChild(floatingForm);

                grid.appendChild(columna);


                menuContainer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('hidden');
                });

                // Cerrar menú al hacer clic fuera
                document.addEventListener('click', () => {
                    menu.classList.add('hidden');
                });

                // Posicionar el popup justo debajo del botón, alineado a la izquierda
                const rect = menuContainer.getBoundingClientRect();
                const popupWidth = 300; // mismo ancho que el CSS .board-popup

                let left = rect.left + window.scrollX;
                let top = rect.bottom + window.scrollY + 8; // espacio entre botón y popup

                // Si el popup se desborda a la derecha, lo ajustamos
                if (left + popupWidth > window.innerWidth - 10) {
                    left = window.innerWidth - popupWidth - 10;
                }

                menu.style.position = 'fixed';
                menu.style.top = `${top}px`;
                menu.style.left = `${left}px`;



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

        //listaTareas.querySelectorAll('.task-draggable').forEach(t => t.remove());

        tareas.forEach(tarea => {
            const tareaElemento = document.createElement("div");
            tareaElemento.classList.add("task-draggable");
            tareaElemento.dataset.tareaId = tarea.id;

            const tareaTitulo = document.createElement("span");
            tareaTitulo.textContent = tarea.titulo;
            tareaElemento.appendChild(tareaTitulo);
            listaTareas.appendChild(tareaElemento); // fallback si no hay botón
            tareaElemento.addEventListener('click', () => {
                console.log('Tarea clickeada:', tarea);
            });
        });

        setupSortableKanban('#kanban-list', '.kanban-column-content', async (evt) => {
            const tarea = evt.item;
            const tareaId = tarea.dataset.tareaId;
            const nuevaColumna = tarea.closest('.kanban-column');
            const nuevoEstadoId = nuevaColumna.dataset.estadoId;

            if (!tareaId || !nuevoEstadoId) {
                console.error('Faltan datos para mover la tarea');
                return;
            }

            const columnas = Array.from(document.querySelectorAll('.kanban-column-content'));
            const nuevoOrden = columnas.map(col => {
                const estadoId = col.closest('.kanban-column')?.dataset.estadoId; // sube al padre con el ID
                return {
                    id: estadoId,
                    orden: Array.from(col.querySelectorAll('.task-draggable')).map((task, idx) => ({
                        tareaId: task.dataset.tareaId,
                        orden: idx
                    }))
                };
            });

            // Llamada a la función para mover las tareas (actualiza en el backend)
            try {
                await moverTareas(tareaId, nuevoEstadoId, nuevoOrden);
                console.log('Tareas actualizadas correctamente en la base de datos');

                // Después de actualizar en el backend, reorganiza las tareas visualmente en el front
                nuevoOrden.forEach(estado => {
                    const columna = document.querySelector(`[data-estado-id="${estado.id}"] .kanban-column-content`);
                    if (columna) {
                        estado.orden.forEach((task, index) => {
                            const taskElement = document.querySelector(`[data-tarea-id="${task.tareaId}"]`);
                            if (taskElement) {
                                columna.appendChild(taskElement);  // Vuelve a mover la tarea a su nueva posición
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error al mover las tareas:', error);
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
