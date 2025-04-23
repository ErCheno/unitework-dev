import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
//import { workspaceDrag } from '../components/dragAnimation.js';
//import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { setupWorkspaceSortable } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import { CreateWorkspaceModal } from '../components/popupCrearWorkspace.js';
import { fetchWorkspaces } from '../../public/js/workspaces.js';
import { mostrarDetallesWorkspace } from '../components/popupUpdateWorkspace.js';
import { fetchBoards } from '../../public/js/board.js';


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
    grid.id = 'workspace-list';

    try {
        const usuarioId = localStorage.getItem('usuario_id');
        const workspaces = await fetchWorkspaces(usuarioId);

        const workspace = workspaces.find(ws => ws.id === parseInt(workspaceId));
        console.log('Buscando workspace con ID:', workspaceId);
        console.log('Todos los IDs disponibles:', workspaces.map(ws => ws.id));

        if (workspace) {

            title.textContent = workspace.nombre;


            /*mostrarDetallesWorkspace(workspace); // Puedes lanzar el modal si quieres, o quitarlo
 
             const card = WorkspaceCard(workspace); // Reutilizas la tarjeta si quieres mostrarla
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


    const cardCrear = document.createElement('div');
    cardCrear.classList.add('board-card', 'create-board-card');

    const text = document.createElement('span');
    text.textContent = '+ Crear un tablero Kanban';

    cardCrear.appendChild(text);

    cardCrear.addEventListener('click', () => {
        const existing = document.querySelector('.board-popup');
        if (existing) existing.remove();

        const popup = CreateBoardPopup(({ nombre, descripcion }) => {
            console.log('Nuevo tablero:', nombre, descripcion);
            // Aquí va tu lógica real para guardar el tablero
        });

        const rect = cardCrear.getBoundingClientRect(); // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        popup.style.top = `${rect.bottom - 60 + window.scrollY}px`;
        popup.style.left = `${rect.left + 240 + window.scrollX}px`;

        document.body.appendChild(popup);
    });
    /*cardCrear.addEventListener('click', async () => {
        const modal = CreateBoardModal();
        document.body.appendChild(modal);
        modal.show();
    });*/


    /* try {
         const usuarioId = localStorage.getItem('usuario_id');
         const boards = await fetchWorkspaces(usuarioId);
         if (boards.length === 0) {
             const noWorkspacesMsg = document.createElement('p');
             noWorkspacesMsg.textContent = '¡Empieza creando un proyecto!';
             noWorkspacesMsg.classList.add('no-workspaces-msg');
             grid.appendChild(noWorkspacesMsg);
         } else {
             boards.forEach(board => {
                 const card = WorkspaceCard(board);
                 card.setAttribute('draggable', true);
                 card.id = `board-${board.id}`;
                 card.classList.add('board-draggable');
                 grid.appendChild(card);
             });
         }
     } catch (error) {
         showToast('Error al cargar los espacios de trabajo: '+error, 'error');
     }*/



    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspace);
    container.appendChild(grid);

    // Agrega al final o donde quieras



    grid.appendChild(cardCrear);

    contentDiv.appendChild(container);

    setupWorkspaceSortable();
}

export function CreateBoardPopup(onSubmit) {
    const popup = document.createElement('div');
    popup.classList.add('board-popup', 'animate-popup');

    const flecha = document.createElement('div');
    flecha.classList.add('popup-arrow');
    popup.appendChild(flecha);

    const form = document.createElement('form');

    const title = document.createElement('h3');
    title.textContent = 'Nuevo Tablero';

    const tituloGroup = document.createElement('div');
    
    const labelTitulo = document.createElement('label');
    labelTitulo.textContent = 'Título';
    
    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.placeholder = 'Título del tablero';
    
    tituloGroup.appendChild(labelTitulo);
    tituloGroup.appendChild(inputTitulo);

    ////

    const descripGroup = document.createElement('div');
    
    const labelDescrip = document.createElement('label');
    labelDescrip.textContent = 'Descripción';
    
    const inputDescrip = document.createElement('textarea');
    inputDescrip.placeholder = 'Descripción del tablero';
    
    descripGroup.appendChild(labelDescrip);
    descripGroup.appendChild(inputDescrip);
    
    // Añades el tituloGroup al formulario o contenedor principal
    

    const textareaDescripcion = document.createElement('textarea');
    textareaDescripcion.placeholder = 'Descripción...';

    const botonCrear = document.createElement('button');
    botonCrear.type = 'submit';
    botonCrear.textContent = 'Crear';

    form.appendChild(title);
    form.appendChild(tituloGroup);
    form.appendChild(descripGroup);
    form.appendChild(botonCrear);
    popup.appendChild(form);

    function closePopup() {
        popup.classList.remove('animate-popup');
        popup.classList.add('fade-out');
        popup.addEventListener('animationend', () => popup.remove(), { once: true });
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = inputNombre.value.trim();
        const descripcion = textareaDescripcion.value.trim();
        if (nombre) {
            onSubmit({ nombre, descripcion });
            closePopup();
        }
    });

    return popup;
}
