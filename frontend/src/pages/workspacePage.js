import Sortable from 'sortablejs';

import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
//import { workspaceDrag } from '../components/dragAnimation.js';
//import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import { CreateWorkspaceModal } from '../components/popupCrearWorkspace.js';
import { fetchWorkspaces } from '../../public/js/workspaces.js';
import { mostrarDetallesWorkspace } from '../components/popupUpdateWorkspace.js';
import { fetchBoards } from '../../public/js/board.js';
import { createBoards } from '../../public/js/board.js';
import { BoardCard } from '../components/boardCard.js';

import { scrollHorizontal, setupSortable } from '../components/dragAnimation.js';

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

    botonVolver.addEventListener('click', () => {
        page('/myworkspaces'); // Redirige a la página de 'Mis Espacios de Trabajo'
    });

    divConjuntoArriba.appendChild(title);
    divConjuntoArriba.appendChild(botonVolver);

    const hrWorkspace = document.createElement('hr');
    hrWorkspace.id = 'hrMyWorkspaces';

    const grid = document.createElement('div');
    grid.id = 'board-list';

    try {
        const usuarioId = localStorage.getItem('usuario_id');
        const workspaces = await fetchWorkspaces(usuarioId);

        const workspace = workspaces.find(ws => ws.id === parseInt(workspaceId));
        console.log('Todos los IDs disponibles:', workspaces.map(ws => ws.id));

        if (workspace) {

            title.textContent = workspace.nombre;

            //const usuarioId = localStorage.getItem('usuario_id');
            try {
                const boards = await fetchBoards(workspace.id);

                // Primero, añade el botón de "Crear tablero Kanban" al principio del grid
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

                    // Pasa el workspaceId correctamente como argumento
                    CreateBoardPopup(workspaceId).then(popup => {
                        document.body.appendChild(popup);
                        requestAnimationFrame(() => popup.classList.remove('hidden'));

                        setTimeout(() => {
                            const rect = cardCrear.getBoundingClientRect();
                            popup.style.top = `${rect.bottom - 60 + window.scrollY}px`;
                            popup.style.left = `${rect.left + 240 + window.scrollX}px`;
                        }, 50);  // Retardo pequeño para asegurarse de que el popup esté en el DOM
                    }).catch(error => {
                        console.error('Error al crear el popup:', error);
                    });
                });

                if (boards.length === 0) {
                    const noBoardsMsg = document.createElement('p');
                    noBoardsMsg.textContent = '¡Empieza creando un proyecto!';
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

            /*mostrarDetallesWorkspace(workspace);
 
             const card = WorkspaceCard(workspace);
             card.setAttribute('draggable', true);
             card.id = `workspace-${workspace.id}`;
             card.classList.add('workspace-draggable');
 
             grid.appendChild(card);
 
             const workspaceTitle = document.createElement('h2');
             workspaceTitle.textContent = workspace.nombre;
             grid.appendChild(workspaceTitle);
 
             const workspaceDescription = document.createElement('p');
             workspaceDescription.textContent = workspace.descripcion;
             grid.appendChild(workspaceDescription);*/



        } else {
            const noWorkspaceMsg = document.createElement('p');
            noWorkspaceMsg.textContent = 'Este tablero kanban no existe o ha sido eliminado.';
            grid.appendChild(noWorkspaceMsg);

        }
        console.log(workspace);



    } catch (error) {
        showToast('Error al cargar el espacio de trabajo: ' + error, 'error');
    }

    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspace);
    scrollHorizontal(grid);
    container.appendChild(grid);

    contentDiv.appendChild(container);
    console.log(window.location.pathname);  // Esto te mostrará la URL completa

    setupSortable('board-list', '.board-draggable', (evt) => {
        console.log('Espacio de trabajo movido de', evt.oldIndex, 'a', evt.newIndex);
    });


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
            console.log("Entre")
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
                    popup.style.top = `${rect.bottom - 60 + window.scrollY}px`;
                    popup.style.left = `${rect.left + 240 + window.scrollX}px`;
                }, 50);  // Retardo pequeño para asegurarse de que el popup esté en el DOM
            }).catch(error => {
                console.error('Error al crear el popup:', error);
            });
        });


        if (boards.length === 0) {
            const noBoardsMsg = document.createElement('p');
            noBoardsMsg.textContent = '¡Empieza creando un proyecto!';
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

