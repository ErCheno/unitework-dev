import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable, setupSortableKanban, setupSortableList } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { cargarTareas, TaskCard } from '../components/taskCard.js';
import { getTareas, crearEstado, getEstado, crearTarea, moverTareas, moverLista, modificarTarea, deleteTask, modificarLista, deleteList } from '../js/task.js';
import { cambiarRolUsuario, fetchBoards, getUsuariosDelTablero, getUsuariosDisponibles, putBoard, selectBoard } from '../js/board.js';
import { mostrarPopupConfirmacion } from '../components/workspaceCard.js';
import { socketMoveList, socketPutList } from '../js/socketsEvents.js';
import { socket } from '../js/socket.js';

export async function BoardPage(boardId) {
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

    const board = await selectBoard(boardId);

    // Sección superior
    const divConjuntoArriba = document.createElement('div');
    divConjuntoArriba.id = 'divConjuntoArriba';

    // Contenedor de miembros (avatares)
    const miembrosContainer = document.createElement('div');
    miembrosContainer.id = 'avatar-container';

    const titleContainer = document.createElement('div');
    titleContainer.id = 'tittleContainer';

    const title = document.createElement('h3');
    title.textContent = board.nombre;
    title.id = 'tituloKanban';
    title.style.margin = 0;

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.style.display = 'none';
    inputTitle.className = 'input-editar-titulo';

    const iconoLapiz = document.createElement('i');
    iconoLapiz.className = 'fa-solid fa-pen';
    iconoLapiz.style.cursor = 'pointer';

    // Al hacer clic en el ícono, mostrar el input
    iconoLapiz.addEventListener('click', () => {
        inputTitle.value = title.textContent;
        title.style.display = 'none';
        iconoLapiz.style.display = 'none';
        inputTitle.style.display = 'inline-block';
        inputTitle.focus();
    });


    // Al salir del input (blur) o presionar Enter, guardar el nuevo título
    inputTitle.addEventListener('blur', () => finalizarEdicion());
    inputTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finalizarEdicion();
        }
    });

    async function finalizarEdicion() {
        const nuevoTitulo = inputTitle.value.trim();

        title.style.display = 'block';
        iconoLapiz.style.display = 'inline-block';
        inputTitle.style.display = 'none';
        console.log(board);
        console.log(board.id);
        await putBoard(board.id, nuevoTitulo);
        title.textContent = nuevoTitulo;
    }



    titleContainer.append(title, inputTitle, iconoLapiz);


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


    // Obtener y mostrar los miembros
    const usuarios = await getUsuariosDelTablero(boardId);
    const avatarGroup = renderAvatarGroup(usuarios, boardId);

    divConjuntoArriba.append(titleContainer, avatarGroup, divBotonesArriba);
    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrBoard';



    // Contenedor Kanban
    const kanbanContainer = document.createElement('div');
    kanbanContainer.id = 'kanban-list';
    //socketPutList(boardId);

    (async () => {


        // Renderizar la lista inicialmente
        await fetchAndRenderList(boardId);

        socketMoveList(boardId);
        // Reordenar columnas (listas)
        setupSortableList('#kanban-list', async (evt) => {
            const listaMovida = evt.item;
            const nuevaPosicion = evt.newIndex;
            const antiguaPosicion = evt.oldIndex;
            const listaId = parseInt(listaMovida.dataset.estadoId);

            console.log('Lista movida:', listaMovida);
            console.log('De posición:', antiguaPosicion, 'a:', nuevaPosicion);

            const columnas = Array.from(document.querySelectorAll('.kanban-column'));
            const nuevoOrden = columnas.map((col, index) => {
                const listaId = parseInt(col.dataset.estadoId);
                const posicionamiento = index;

                // Console log para verificar los valores de listaId y posicionamiento
                console.log(`listaId: ${listaId}, posicionamiento: ${posicionamiento}`);

                return {
                    listaId: listaId,
                    posicionamiento: posicionamiento
                };
            });

            console.log('Columnas actuales:', columnas);
            console.log('Nuevo orden:', nuevoOrden);

            try {
                const response = await moverLista(boardId, nuevoOrden);
                socket.emit('mover-lista', { boardId, nuevoOrden });

                if (response && response.success) {
                    console.log('Orden actualizado correctamente en el backend');

                    const parent = document.querySelector('#kanban-list');

                    // Asegúrate de que `nuevoOrden` es el array con las listas ordenadas desde el backend
                    const columnasOrdenadas = nuevoOrden.map(item =>
                        document.querySelector(`[data-estado-id="${item.listaId}"]`)
                    );

                    // Ordena las listas en el frontend según el `posicionamiento`
                    columnasOrdenadas.sort((a, b) => {
                        const posA = nuevoOrden.find(item => item.listaId == a.dataset.estadoId).posicionamiento;
                        const posB = nuevoOrden.find(item => item.listaId == b.dataset.estadoId).posicionamiento;
                        return posA - posB;  // Orden ascendente basado en el `posicionamiento`
                    });

                    // Reorganizar las listas visualmente
                    columnasOrdenadas.forEach(columna => {
                        if (columna) {
                            parent.appendChild(columna);  // Esto mueve las listas en el DOM a su nueva posición
                        }
                    });

                } else {
                    console.error('Error al mover las columnas', response?.message);
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

function renderAvatarGroup(usuarios, boardId) {
    const container = document.createElement('div');
    container.className = 'avatar-group';
    console.log(usuarios);

    usuarios.forEach(usuario => {
        const avatar = document.createElement('img');
        avatar.className = 'avatar-circle';
        avatar.src = usuario.avatar_url;
        avatar.title = usuario.email;
        avatar.alt = usuario.email;
        container.appendChild(avatar);
    });

    container.addEventListener('click', () => {
        abrirPopupGestionUsuarios(boardId);

    });


    return container;
}



export async function fetchAndRenderList(boardId) {
    try {
        const respuesta = await getEstado(boardId);
        const estados = respuesta.listas || [];

        const grid = document.getElementById('kanban-list');
        if (!grid) return;

        grid.textContent = ''; // Limpiar tarjetas anteriores

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

                columna.style.background = estado.color;

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
                detalle.textContent = 'Editar lista';

                const eliminar = document.createElement('li');
                eliminar.textContent = 'Eliminar espacio';
                eliminar.id = 'eliminarLi';

                menu.appendChild(detalle);
                menu.appendChild(eliminar);

                titulo.textContent = estado.nombre;

                const listaTareas = document.createElement("div");
                listaTareas.classList.add("kanban-column-content");
                listaTareas.style.background = estado.color;

                /*if (estado.tareas && estado.tareas.length > 0) {
                    fetchAndRenderTasks(estado);
                }*/


                menuContainer.appendChild(menu);
                menuContainer.title = 'Haz clic para abrir el menú de lista';

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

                eliminar.addEventListener('click', async () => {
                    const confirmado = await mostrarPopupConfirmacion();
                    if (!confirmado) return;

                    try {
                        await deleteList(estado.id, estado.tablero_id);
                        fetchAndRenderList(estado.tablero_id);
                        socket.emit('eliminar-lista', boardId); // Lo envía al resto


                    } catch (error) {
                        console.error("Error al eliminar el tablero:", error);
                    }
                });

                detalle.addEventListener('click', () => {
                    console.log(estado);
                    popupEditarLista(estado);
                });

                // Confirmar creación

                addBtn.addEventListener('click', async () => {
                    const summary = textarea.value.trim();
                    if (!summary) return showToast('Debes escribir un nombre');

                    // Llamamos a crearTarea con el estado.id y el nombre de la tarea
                    await crearTarea(estado, summary, boardId);
                    await fetchAndRenderTasks(estado, boardId);


                    textarea.value = '';
                    floatingForm.classList.add('hidden');
                    createBtn.classList.remove('hidden');

                });

                columna.appendChild(createBtn);
                columna.appendChild(floatingForm);

                grid.appendChild(columna);


                menuContainer.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // Calcular posición justo al hacer clic
                    const rect = menuContainer.getBoundingClientRect();
                    const popupWidth = 150; // coincide con .task-menu

                    let left = rect.left + window.scrollX;
                    let top = rect.bottom + window.scrollY + 8;

                    if (left + popupWidth > window.innerWidth - 10) {
                        left = window.innerWidth - popupWidth - 10;
                    }

                    menu.style.position = 'fixed';
                    menu.style.top = `${top}px`;
                    menu.style.left = `${left}px`;

                    menu.classList.toggle('hidden');
                });


                // Cerrar menú al hacer clic fuera
                document.addEventListener('click', () => {
                    menu.classList.add('hidden');
                });

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



        listaTareas.querySelectorAll('.task-draggable').forEach(t => t.remove());

        tareas.forEach(tarea => {
            const tareaElemento = document.createElement("div");
            tareaElemento.classList.add("task-draggable");
            tareaElemento.title = 'Haz clic para abrir el menú de tareas';
            tareaElemento.dataset.tareaId = tarea.id;

            tareaElemento.style.borderLeft = `8px solid ${tarea.color}`;

            const tareaTitulo = document.createElement("span");
            tareaTitulo.textContent = tarea.titulo;
            tareaElemento.appendChild(tareaTitulo);
            tareaElemento.addEventListener('click', () => {
                console.log('Tarea clickeada:', tarea);
                popupEditarTarea(tarea, estado);
            });
            listaTareas.appendChild(tareaElemento); // fallback si no hay botón

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

                // 🔁 Emitir a través del socket para que otros clientes reactualicen el tablero
                socket.emit("mover-tarea", {
                    tareaId: tareaId,
                    estado: {
                        id: parseInt(nuevoEstadoId), tablero_id: parseInt(estado.tablero_id), color: estado.color, nombre: estado.nombre,
                    },
                    nuevoOrden: nuevoOrden
                });

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
                socket.emit('crear-lista', boardId); // Lo envía al resto

                cerrarPopup();
            }
        } catch (err) {
            console.error(err);
        }
    });
}


export function popupEditarTarea(tarea, estado) {
    // Eliminar cualquier popup anterior
    const existingPopup = document.getElementById('popupEditarTarea');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'popupEditarTarea';
    popup.className = 'popup-editar-tarea';

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'taskEdit-content';

    const tituloContainer = document.createElement('div');
    tituloContainer.id = 'tituloContainer';

    const titulo = document.createElement('h3');
    titulo.textContent = tarea.titulo;
    titulo.style.margin = 0;

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.style.display = 'none';
    inputTitulo.value = tarea.titulo;
    inputTitulo.className = 'input-editar-titulo';

    const iconoLapiz = document.createElement('i');
    iconoLapiz.className = 'fa-solid fa-pen';
    iconoLapiz.style.cursor = 'pointer';

    // Al hacer clic en el ícono, mostrar el input
    iconoLapiz.addEventListener('click', () => {
        titulo.style.display = 'none';
        iconoLapiz.style.display = 'none';
        inputTitulo.style.display = 'inline-block';
        inputTitulo.focus();
    });

    // Al salir del input (blur) o presionar Enter, guardar el nuevo título
    inputTitulo.addEventListener('blur', () => finalizarEdicion());
    inputTitulo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finalizarEdicion();
        }
    });

    async function finalizarEdicion() {
        const nuevoTitulo = inputTitulo.value.trim();
        if (nuevoTitulo && nuevoTitulo !== tarea.titulo) {
            tarea.titulo = nuevoTitulo;
            titulo.textContent = nuevoTitulo;
            await modificarTarea(tarea);
            fetchAndRenderTasks(estado);
        }
        titulo.style.display = 'block';
        iconoLapiz.style.display = 'inline-block';
        inputTitulo.style.display = 'none';
    }

    const divTop = document.createElement('div');
    divTop.id = 'divTop';

    const borrarButton = document.createElement('div');
    borrarButton.id = 'borrarButton';
    borrarButton.title = 'Haz clic para eliminar la tarea';

    const spanBorrar = document.createElement('span');
    spanBorrar.id = 'spanBorrar';

    spanBorrar.className = 'fa-solid fa-trash';

    borrarButton.appendChild(spanBorrar);


    tituloContainer.append(titulo, inputTitulo, iconoLapiz);

    divTop.appendChild(tituloContainer);
    divTop.appendChild(borrarButton);

    const hr = document.createElement('hr');
    hr.id = 'hrEditarTarea';

    const listaSituada = document.createElement('span');
    listaSituada.id = 'listaSituada';
    // Limpia el contenido previo
    listaSituada.textContent = 'Tarea situada en la lista: ';

    // Crea un span para la parte en negrita
    const estadoSpan = document.createElement('span');
    estadoSpan.textContent = tarea.estado;
    estadoSpan.style.fontWeight = 'bolder';

    // Añade el span al nodo principal
    listaSituada.appendChild(estadoSpan);
    ////
    const divDescrip = document.createElement('div');
    divDescrip.id = 'divDescrip';

    const icoDescrip = document.createElement('i');
    icoDescrip.className = 'fa-regular fa-file-alt';
    icoDescrip.id = 'icoDescrip';

    const inputLabelDescrip = document.createElement('label');
    inputLabelDescrip.id = 'inputLabel';
    inputLabelDescrip.textContent = 'Descripción';

    divDescrip.appendChild(icoDescrip);
    divDescrip.appendChild(inputLabelDescrip);

    const inputDescrip = document.createElement('textarea');
    inputDescrip.value = tarea.descripcion || '';
    inputDescrip.placeholder = 'Nueva descripción';

    // Crear el contenedor del color
    const divColor = document.createElement('div');
    divColor.id = 'divColor';

    // Icono de paleta
    const icoColor = document.createElement('i');
    icoColor.className = 'fa-regular fas fa-palette';
    icoColor.id = 'icoColor';

    // Label
    const inputLabelColor = document.createElement('label');
    inputLabelColor.id = 'inputLabel';
    inputLabelColor.textContent = ' Color';
    inputLabelColor.setAttribute('for', 'inputColor');

    // Selector de color
    const inputColor = document.createElement('input');
    inputColor.type = 'color';
    inputColor.id = 'inputColor';
    inputColor.name = 'color';
    inputColor.value = '#3498db'; // Valor inicial


    // Evento para cambiar el color dinámicamente
    inputColor.addEventListener('input', () => {
        tarea.color = inputColor.value;
        content.style.borderLeft = '8px solid ' + inputColor.value;


    });

    // Agregar al DOM
    divColor.appendChild(icoColor);
    divColor.appendChild(inputLabelColor);
    divColor.appendChild(inputColor);

    const acciones = document.createElement('div');
    acciones.className = 'taskEdit-actions';

    const guardar = document.createElement('button');
    guardar.textContent = 'Guardar';
    guardar.className = 'taskEdit-confirmar';

    guardar.addEventListener('click', async () => {
        await modificarTarea(tarea, inputDescrip, inputColor);
        fetchAndRenderTasks(estado);

    });

    borrarButton.addEventListener('click', async () => {
        await deleteTask(tarea.id);
        fetchAndRenderTasks(estado);

    });

    const cancelar = document.createElement('button');
    cancelar.textContent = 'Cancelar';
    cancelar.className = 'taskEdit-cancelar';

    acciones.append(guardar, cancelar);
    content.append(divTop, listaSituada, hr, divDescrip, inputDescrip, divColor, inputColor, acciones);
    popup.append(overlay, content);
    document.body.appendChild(popup);

    // Cerrar popup
    cancelar.addEventListener('click', () => popup.remove());
    guardar.addEventListener('click', () => popup.remove());
    borrarButton.addEventListener('click', () => popup.remove());
    overlay.addEventListener('click', () => popup.remove());



}



/////



export function popupEditarLista(estado) {
    // Eliminar cualquier popup anterior
    const existingPopup = document.getElementById('popupEditarLista');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'popupEditarLista';
    popup.className = 'popup-editar-lista';

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'listEdit-content';

    const tituloContainer = document.createElement('div');
    tituloContainer.id = 'tituloContainer';

    const titulo = document.createElement('h3');
    titulo.textContent = estado.nombre;
    titulo.style.margin = 0;

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.style.display = 'none';
    inputTitulo.value = estado.nombre;
    inputTitulo.className = 'input-editar-titulo';

    const iconoLapiz = document.createElement('i');
    iconoLapiz.className = 'fa-solid fa-pen';
    iconoLapiz.style.cursor = 'pointer';

    // Al hacer clic en el ícono, mostrar el input
    iconoLapiz.addEventListener('click', () => {
        titulo.style.display = 'none';
        iconoLapiz.style.display = 'none';
        inputTitulo.style.display = 'inline-block';
        inputTitulo.focus();
    });

    // Al salir del input (blur) o presionar Enter, guardar el nuevo título
    inputTitulo.addEventListener('blur', () => finalizarEdicion());
    inputTitulo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finalizarEdicion();
        }
    });

    async function finalizarEdicion() {
        const nuevoTitulo = inputTitulo.value.trim();
        if (nuevoTitulo && nuevoTitulo !== estado.nombre) {
            estado.nombre = nuevoTitulo;
            titulo.textContent = nuevoTitulo;
            await modificarLista(estado.id, nuevoTitulo);
            fetchAndRenderList(estado.tablero_id);
            //console.log(estado);
            socket.emit('modificar-lista', {
                estado: {
                    id: parseInt(estado.id),
                    tablero_id: parseInt(estado.tablero_id),
                    color: estado.color,
                    nombre: estado.nombre
                }
            });

        }
        titulo.style.display = 'block';
        iconoLapiz.style.display = 'inline-block';
        inputTitulo.style.display = 'none';
    }


    const divTop = document.createElement('div');
    divTop.id = 'divTop';

    const borrarButton = document.createElement('div');
    borrarButton.id = 'borrarButton';
    borrarButton.title = 'Haz clic para eliminar la lista';

    const spanBorrar = document.createElement('span');
    spanBorrar.id = 'spanBorrar';

    spanBorrar.className = 'fa-solid fa-trash';

    borrarButton.appendChild(spanBorrar);


    tituloContainer.append(titulo, inputTitulo, iconoLapiz);

    divTop.appendChild(tituloContainer);
    divTop.appendChild(borrarButton);

    const hr = document.createElement('hr');
    hr.id = 'hrEditarTarea';

    ////
    const divColor = document.createElement('div');
    divColor.id = 'divColor';

    const icoColor = document.createElement('i');
    icoColor.className = 'fa-regular fas fa-brush';
    icoColor.id = 'icoColor';

    const inputLabelColor = document.createElement('label');
    inputLabelColor.id = 'inputLabel';
    inputLabelColor.textContent = ' Escoge un color para la lista:';
    inputLabelColor.setAttribute('for', 'inputColor');

    const coloresPastel = [
        '#ABE2A5', '#E2C5A5', '#C5A5E2', '#95a9df', '#8fc7e0',
        '#8dd5dd', '#F0E795', '#F0B795', '#E2A5A5', '#E2A5B2', '#E2A5DF', '#FAFAFA'
    ];

    const contenedorColores = document.createElement('div');
    contenedorColores.className = 'selector-colores';


    // Si estado.color ya existe, aplicamos el fondo desde el principio
    if (estado.color) {
        content.style.background = estado.color;
    }

    coloresPastel.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        colorBtn.title = color;

        // Marcar el color activo si coincide con el actual
        if (estado.color && color.toLowerCase() === estado.color.toLowerCase()) {
            colorBtn.classList.add('active');
        }

        colorBtn.addEventListener('click', () => {
            estado.color = color;
            content.style.background = color;

            // Opcional: marcar el color activo visualmente
            document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
            colorBtn.classList.add('active');
        });


        contenedorColores.appendChild(colorBtn);
    });

    divColor.appendChild(icoColor);
    divColor.appendChild(inputLabelColor);


    const acciones = document.createElement('div');
    acciones.className = 'taskEdit-actions';

    const guardar = document.createElement('button');
    guardar.textContent = 'Guardar';
    guardar.className = 'taskEdit-confirmar';

    guardar.addEventListener('click', async () => {
        await modificarLista(estado.id, inputTitulo.value, estado.color);
        fetchAndRenderList(estado.tablero_id);

    });

    borrarButton.addEventListener('click', async () => {
        const confirmado = await mostrarPopupConfirmacion();
        if (!confirmado) return;

        try {
            await deleteList(estado.id, estado.tablero_id);
            fetchAndRenderList(estado.tablero_id);
        } catch (error) {
            console.error("Error al eliminar el tablero:", error);
        }
    });

    const cancelar = document.createElement('button');
    cancelar.textContent = 'Cancelar';
    cancelar.className = 'taskEdit-cancelar';

    acciones.append(guardar, cancelar);
    content.append(divTop, hr, divColor, contenedorColores, acciones);
    popup.append(overlay, content);
    document.body.appendChild(popup);

    // Cerrar popup
    cancelar.addEventListener('click', () => popup.remove());
    guardar.addEventListener('click', () => popup.remove());
    borrarButton.addEventListener('click', () => popup.remove());
    overlay.addEventListener('click', () => popup.remove());



}
export async function abrirPopupGestionUsuarios(boardId) {
    const usuarios = await getUsuariosDelTablero(boardId);
    const emailUsuario = localStorage.getItem('email');

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'popup-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'popup-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => overlay.remove());
    content.appendChild(closeBtn);


    usuarios.forEach(usuario => {
        const userRow = document.createElement('div');
        userRow.className = 'user-row';

        const avatar = document.createElement('img');
        avatar.className = 'avatar-circle';
        avatar.src = usuario.avatar_url;
        avatar.alt = usuario.nombre;

        const info = document.createElement('div');
        info.className = 'user-info';

        const nombre = document.createElement('strong');
        nombre.textContent = usuario.nombre;

        const email = document.createElement('div');
        email.textContent = usuario.email;

        info.appendChild(nombre);
        info.appendChild(email);

        const selectContainer = document.createElement('div');
        selectContainer.className = 'select-container';

        if (usuario.email === emailUsuario) {
            const tuLabel = document.createElement('span');
            tuLabel.className = 'label-tu';
            tuLabel.textContent = 'Tú';
            selectContainer.appendChild(tuLabel);
        } else {
            const select = document.createElement('select');
            select.className = 'select-rol';

            const optMiembro = document.createElement('option');
            optMiembro.value = 'miembro';
            optMiembro.textContent = 'Miembro';

            const optAdmin = document.createElement('option');
            optAdmin.value = 'admin';
            optAdmin.textContent = 'Administrador';

            select.appendChild(optMiembro);
            select.appendChild(optAdmin);

            // Set value según el rol actual
            select.value = usuario.rol;

            select.addEventListener('change', async () => {
                const nuevoRol = select.value;
                const result = await cambiarRolUsuario(boardId, usuario.id, nuevoRol);
                if (!result.success) {
                    // Si falla, restauramos el valor anterior
                    select.value = usuario.rol;
                    alert("Error al actualizar el rol");
                } else {
                    // Si va bien, actualizamos el rol en el objeto local (opcional)
                    usuario.rol = nuevoRol;
                }
            });

            selectContainer.appendChild(select);
        }

        userRow.appendChild(avatar);
        userRow.appendChild(info);
        userRow.appendChild(selectContainer);

        content.appendChild(userRow);
    });

    overlay.appendChild(content);
    document.body.appendChild(overlay);
}
