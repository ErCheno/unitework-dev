import Sortable from 'sortablejs';

import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
//import { workspaceDrag } from '../components/dragAnimation.js';
//import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import { fetchWorkspaces } from '../js/workspaces.js';
import { fetchBoards } from '../js/board.js';
import { createBoards } from '../js/board.js';
import { BoardCard } from '../components/boardCard.js';

import { scrollHorizontal, setupSortable } from '../components/dragAnimation.js';
import { createMindMap, fetchMindMaps } from '../js/mindMap.js';
import { MindMapCard } from '../components/mindMapCard.js';

export async function workspacePage(workspaceId) {
    cleanupView();

    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const container = document.createElement('div');
    container.id = 'container';

    const navbar = Navbar();
    const topbar = TopNavbar();

    container.appendChild(navbar);
    container.appendChild(topbar);

    const divConjuntoArriba = document.createElement('div');
    divConjuntoArriba.id = 'divConjuntoArriba';

    const title = document.createElement('h1');
    title.id = 'tituloWorkspace';

    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolver';
    const icoVolver = document.createElement('i');
    icoVolver.className = 'fa-solid fa-chevron-left';
    icoVolver.id = 'icoVolver';
    const parrafoVolver = document.createElement('p');
    parrafoVolver.id = 'parrafoVolver';
    parrafoVolver.textContent = 'Volver';

    botonVolver.appendChild(icoVolver);
    botonVolver.appendChild(parrafoVolver);

    const divBotonesArriba = document.createElement('div');
    divBotonesArriba.id = 'divBotonesArriba';

    const botonRecarga = document.createElement('button');
    botonRecarga.id = 'botonRecarga';
    botonRecarga.title = 'Recargar Espacios de trabajo'
    const icoRecarga = document.createElement('i');
    icoRecarga.className = 'fa-solid fa-rotate-right';
    icoRecarga.id = 'icoRecarga';

    botonRecarga.append(icoRecarga);
    botonRecarga.addEventListener('click', () => {
        fetchAndRenderBoards(workspaceId);
        renderMindMapView(workspaceId);
    });

    botonVolver.addEventListener('click', () => {
        page('/myworkspaces'); // Redirige a la página de 'Mis Espacios de Trabajo'
    });

    divConjuntoArriba.appendChild(title);
    divBotonesArriba.appendChild(botonRecarga);
    divBotonesArriba.appendChild(botonVolver);

    divConjuntoArriba.appendChild(divBotonesArriba);

    const hrWorkspace = document.createElement('hr');
    hrWorkspace.id = 'hrMyWorkspaces';

    const grid = document.createElement('div');
    grid.id = 'board-list';

    try {
        //const usuarioId = localStorage.getItem('usuario_id');
        const workspaces = await fetchWorkspaces();

        const workspace = workspaces.find(ws => ws.id === parseInt(workspaceId));

        if (workspace) {

            title.textContent = workspace.nombre;

            //const usuarioId = localStorage.getItem('usuario_id');
            try {
                const boards = await fetchBoards(workspace.id);
                if (workspace.rol === 'admin') {
                    const cardCrear = document.createElement('div');
                    cardCrear.classList.add('board-card', 'create-board-card');
                    const text = document.createElement('span');
                    text.textContent = '+ Crear un tablero Kanban';
                    cardCrear.appendChild(text);
                    cardCrear.setAttribute('aria-label', 'Crear un nuevo tablero');
                    grid.appendChild(cardCrear);  // Aquí es donde aseguramos que esté al principio

                    cardCrear.addEventListener('click', () => {
                        const existing = document.querySelector('.board-popup');
                        if (existing) existing.remove();

                        CreateBoardPopup(workspaceId).then(popup => {
                            document.body.appendChild(popup);
                            requestAnimationFrame(() => popup.classList.remove('hidden'));

                            setTimeout(() => {
                                const rect = cardCrear.getBoundingClientRect();
                                popup.style.top = `${rect.bottom - 75 + window.scrollY}px`;
                                popup.style.left = `${rect.left + 240 + window.scrollX}px`;
                            }, 50);
                        }).catch(error => {
                            console.error('Error al crear el popup:', error);
                        });
                    });
                }


                if (boards.length === 0) {
                    const noBoardsMsg = document.createElement('p');
                    noBoardsMsg.textContent = '¡Empieza creando un tablero kanban!';
                    noBoardsMsg.classList.add('no-workspaces-msg');
                    grid.appendChild(noBoardsMsg);
                } else {
                    boards.forEach(board => {
                        const card = BoardCard(board);
                        card.setAttribute('draggable', true);
                        card.id = `board-${board.id}`;
                        card.classList.add('board-draggable');
                        grid.appendChild(card);
                    });
                }
            } catch (error) {
                console.error('Error al cargar los tableros: ' + error, 'error');
            }

        } else {
            const noWorkspaceMsg = document.createElement('p');
            noWorkspaceMsg.textContent = 'Este tablero kanban no existe o ha sido eliminado.';
            grid.appendChild(noWorkspaceMsg);

        }



    } catch (error) {
        showToast('Error al cargar el espacio de trabajo: ' + error, 'error');
    }

    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspace);
    scrollHorizontal(grid);
    container.appendChild(grid);

    contentDiv.appendChild(container);

    setupSortable('board-list', '.board-draggable', (evt) => {
        console.log('Espacio de trabajo movido de', evt.oldIndex, 'a', evt.newIndex);
    });

    renderMindMapView(workspaceId);



}


export async function CreateBoardPopup(workspaceId) {
    const popup = document.createElement('div');
    popup.classList.add('board-popup');
    setTimeout(() => {
        popup.classList.add('animate-popup');
    }, 50);
    const flecha = document.createElement('div');
    flecha.classList.add('popup-arrow');
    popup.appendChild(flecha);

    const form = document.createElement('form');

    const imgKanban = document.createElement('img');
    imgKanban.id = 'kanbanImgExample';
    imgKanban.src = '../public/img/kanbanboardexample.png'

    const title = document.createElement('h3');
    title.textContent = 'Crear Tablero';
    title.id = 'tittle-new-board';

    const tituloGroup = document.createElement('div');
    tituloGroup.classList.add('input-group');

    const labelTitulo = document.createElement('label');
    labelTitulo.textContent = 'Título del tablero';

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.placeholder = 'Ej: Tablero de Pepito 1';
    inputTitulo.setAttribute('aria-label', 'Pon un título para el tablero');

    tituloGroup.appendChild(labelTitulo);
    tituloGroup.appendChild(inputTitulo);

    ////

    const descripGroup = document.createElement('div');
    descripGroup.classList.add('input-group');

    const labelDescrip = document.createElement('label');
    labelDescrip.textContent = 'Descripción (opcional)';

    const inputDescrip = document.createElement('textarea');
    inputDescrip.placeholder = 'Ej: Desarrollo de Marketing...';
    inputDescrip.setAttribute('aria-label', 'Pon una descripción clara para el tablero');

    descripGroup.appendChild(labelDescrip);
    descripGroup.appendChild(inputDescrip);

    // Añades el tituloGroup al formulario o contenedor principal


    const textareaDescripcion = document.createElement('textarea');
    textareaDescripcion.placeholder = 'Descripción...';

    const botonCrear = document.createElement('button');
    botonCrear.type = 'submit';
    botonCrear.id = 'botonCrear';
    botonCrear.textContent = 'Crear';
    botonCrear.title = 'Haz clic para crear el tablero kanban';

    form.appendChild(title);
    form.appendChild(imgKanban);
    form.appendChild(tituloGroup);
    form.appendChild(descripGroup);
    form.appendChild(botonCrear);
    popup.appendChild(form);

    function closePopup() {
        popup.classList.remove('animate-popup');
        popup.classList.add('fade-out');

        popup.addEventListener('animationend', () => {
            popup.remove();
        }, { once: true });
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    }

    function handleClickOutside(e) {
        if (!popup.contains(e.target)) closePopup();
    }

    function handleEscape(e) {
        if (e.key === 'Escape') closePopup();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = inputTitulo.value.trim();
        const descripcion = inputDescrip.value.trim();

        if (!nombre) {
            showToast("El nombre del tablero es obligatorio", "error");
            return;
        }

        if (!workspaceId) {
            showToast("ID del espacio de trabajo no disponible", "error");
            return;
        }

        try {
            // Crear el tablero
            await createBoards(nombre, descripcion, workspaceId);

            // Refrescar las tarjetas del tablero
            await fetchAndRenderBoards(workspaceId);

            // Cerrar el popup después de crear el tablero
            closePopup();

        } catch (error) {
            // Manejar cualquier error
            showToast("Error al crear el tablero: " + error.message, "error");
        }
    });




    return popup;

}




async function fetchAndRenderBoards(workspaceId) {
    try {
        const boards = await fetchBoards(workspaceId);

        const grid = document.getElementById('board-list');
        if (!grid) return;

        grid.textContent = ''; // Limpiar tarjetas anteriores

        // Agrega la tarjeta de "Crear un tablero" otra vez
        const cardCrear = document.createElement('div');
        cardCrear.classList.add('board-card', 'create-board-card');

        const text = document.createElement('span');
        text.textContent = '+ Crear un tablero Kanban';
        cardCrear.appendChild(text);
        cardCrear.setAttribute('aria-label', 'Crear un nuevo tablero');

        // Asegurarse de que el cardCrear se añada antes de las tarjetas existentes
        grid.appendChild(cardCrear);

        // Cuando el usuario hace clic para crear un tablero
        cardCrear.addEventListener('click', () => {
            const existing = document.querySelector('.board-popup');

            if (existing) existing.remove();

            // Pasa el workspaceId correctamente como argumento
            CreateBoardPopup(workspaceId).then(popup => {
                document.body.appendChild(popup);

                setTimeout(() => {
                    const rect = cardCrear.getBoundingClientRect();
                    popup.style.top = `${rect.bottom - 75 + window.scrollY}px`;
                    popup.style.left = `${rect.left + 240 + window.scrollX}px`;
                }, 50);  // Retardo pequeño para asegurarse de que el popup esté en el DOM
            }).catch(error => {
                console.error('Error al crear el popup:', error);
            });
        });


        if (boards.length === 0) {
            const noBoardsMsg = document.createElement('p');
            noBoardsMsg.textContent = '¡Empieza creando un tablero kanban!';
            noBoardsMsg.classList.add('no-workspaces-msg');
            grid.appendChild(noBoardsMsg);
        } else {
            // Luego, agrega las tarjetas de los tableros existentes
            boards.forEach(board => {
                const card = BoardCard(board);
                card.setAttribute('draggable', true);
                card.id = `board-${board.id}`;
                card.classList.add('board-draggable');
                grid.appendChild(card);
            });
        }




    } catch (err) {
        console.error('Error al recargar los tableros:', err);
    }
}

// Renderizado principal de la vista mapas mentales
export async function renderMindMapView(workspaceId) {
    try {
        // Obtener mapas mentales del workspace
        const mapasMentales = await fetchMindMaps(workspaceId);

        // Contenedor principal donde van los mapas
        const mapaContainer = document.getElementById('mind-list') || (() => {
            const container = document.createElement('div');
            container.id = 'mind-list';
            document.getElementById('content')?.appendChild(container) || document.body.appendChild(container);
            return container;
        })();

        mapaContainer.textContent = ''; // Limpiar mapas mentales previos
        const workspaces = await fetchWorkspaces();

        const workspace = workspaces.find(ws => ws.id === parseInt(workspaceId));

        if (workspace.rol === 'admin') {

            // Botón para crear mapa mental
            const cardCrear = document.createElement('div');
            cardCrear.classList.add('mindmap-card', 'create-map-card');
            cardCrear.setAttribute('aria-label', 'Crear un nuevo mapa mental');
            cardCrear.textContent = '+ Crear un mapa mental';
            // Listener para mostrar popup creación mapa
            cardCrear.addEventListener('click', () => {
                const existing = document.querySelector('.mentalmap-popup');
                if (existing) existing.remove();

                CreateMindmapPopup(workspaceId).then(popup => {
                    document.body.appendChild(popup);

                    setTimeout(() => {
                        const rect = cardCrear.getBoundingClientRect();
                        popup.style.top = `${rect.bottom - 90 + window.scrollY}px`;
                        popup.style.left = `${rect.left + 240 + window.scrollX}px`;
                    }, 50);
                }).catch(console.error);
            });
            mapaContainer.appendChild(cardCrear);

        }

        if (mapasMentales.length === 0) {
            const noMapsMsg = document.createElement('p');
            noMapsMsg.textContent = '¡Empieza creando un mapa mental!';
            noMapsMsg.classList.add('no-workspaces-msg');
            mapaContainer.appendChild(noMapsMsg);
        } else {
            mapasMentales.forEach(mapa => {
                const card = MindMapCard(mapa);
                card.setAttribute('draggable', true);
                card.classList.add('mindmap-draggable');
                card.id = `mindmap-${mapa.id}`;
                mapaContainer.appendChild(card);
            });
        }

        setupSortable('mind-list', '.mindmap-draggable', (evt) => {
            console.log('Espacio de trabajo movido de', evt.oldIndex, 'a', evt.newIndex);
        });
    } catch (error) {
        console.error('Error al cargar los mapas mentales:', error);
        showToast('Error al cargar los mapas mentales: ' + error.message, 'error');
    }
}

// Creación de la tarjeta para cada mapa mental
export function mindMapCard(mindMap) {
    const { id, titulo, descripcion, fecha_creacion } = mindMap;

    const card = document.createElement('div');
    card.classList.add('mindmap-card', 'rounded', 'shadow', 'p-3');
    card.id = `mindmap-${id}`;

    const title = document.createElement('h3');
    title.classList.add('mindmap-title');
    title.textContent = titulo || 'Mapa sin título';

    const desc = document.createElement('p');
    desc.classList.add('mindmap-desc');
    desc.textContent = descripcion ? descripcion.substring(0, 100) : 'Sin descripción';

    const date = document.createElement('span');
    date.classList.add('mindmap-date');
    date.textContent = fecha_creacion ? `Creado el ${new Date(fecha_creacion).toLocaleDateString()}` : '';

    const openBtn = document.createElement('button');
    openBtn.classList.add('open-mindmap-btn');
    openBtn.textContent = 'Abrir mapa';
    openBtn.addEventListener('click', () => {
        window.location.href = `/mentalmap/${id}`;
    });

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(date);
    card.appendChild(openBtn);

    return card;
}

export async function CreateMindmapPopup(workspaceId) {
    const popup = document.createElement('div');
    popup.classList.add('mindmap-popup'); // puedes usar otra clase como 'mindmap-popup' si lo prefieres
    setTimeout(() => {
        popup.classList.add('animate-popup');
    }, 50);

    const flecha = document.createElement('div');
    flecha.classList.add('popup-arrow');
    popup.appendChild(flecha);

    const form = document.createElement('form');

    const imgMindmap = document.createElement('img');
    imgMindmap.id = 'mindmapImgExample';
    imgMindmap.src = '../../../img/mindmaplogo.png'; // cambia por tu imagen de ejemplo

    const title = document.createElement('h3');
    title.textContent = 'Crear Mapa Mental';
    title.id = 'tittle-new-mindmap';

    const tituloGroup = document.createElement('div');
    tituloGroup.classList.add('input-group');

    const labelTitulo = document.createElement('label');
    labelTitulo.textContent = 'Título del mapa';

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.placeholder = 'Ej: Mapa de ideas para proyecto';
    inputTitulo.setAttribute('aria-label', 'Pon un título para el mapa mental');

    tituloGroup.appendChild(labelTitulo);
    tituloGroup.appendChild(inputTitulo);

    const descripGroup = document.createElement('div');
    descripGroup.classList.add('input-group');

    const labelDescrip = document.createElement('label');
    labelDescrip.textContent = 'Descripción (opcional)';

    const inputDescrip = document.createElement('textarea');
    inputDescrip.placeholder = 'Ej: Estructura de contenidos del curso...';
    inputDescrip.setAttribute('aria-label', 'Pon una descripción clara para el mapa');

    descripGroup.appendChild(labelDescrip);
    descripGroup.appendChild(inputDescrip);

    const botonCrear = document.createElement('button');
    botonCrear.type = 'submit';
    botonCrear.id = 'botonCrearMindmap';
    botonCrear.textContent = 'Crear';
    botonCrear.title = 'Haz clic para crear el mapa mental';

    form.appendChild(title);
    form.appendChild(imgMindmap);
    form.appendChild(tituloGroup);
    form.appendChild(descripGroup);
    form.appendChild(botonCrear);
    popup.appendChild(form);

    function closePopup() {
        popup.classList.remove('animate-popup');
        popup.classList.add('fade-out');
        popup.addEventListener('animationend', () => {
            popup.remove();
        }, { once: true });
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    }

    function handleClickOutside(e) {
        if (!popup.contains(e.target)) closePopup();
    }

    function handleEscape(e) {
        if (e.key === 'Escape') closePopup();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = inputTitulo.value.trim();
        const descripcion = inputDescrip.value.trim();

        if (!nombre) {
            showToast("El nombre del mapa mental es obligatorio", "error");
            return;
        }

        if (!workspaceId) {
            showToast("ID del espacio de trabajo no disponible", "error");
            return;
        }

        try {
            await createMindMap(nombre, descripcion, workspaceId);
            await renderMindMapView(workspaceId);
            closePopup();
        } catch (error) {
            showToast("Error al crear el mapa mental: " + error.message, "error");
        }
    });

    return popup;
}

