import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
import { workspaceDrag } from '../components/dragAnimation.js';
import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import { CreateWorkspaceModal } from '../components/popupCrearWorkspace.js';
import { fetchWorkspaces } from '../../public/js/workspaces.js';
import { mostrarDetallesWorkspace } from '../components/popupUpdateWorkspace.js';


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
    icoVolver.className = 'fa-solid fa-arrow-left';
    icoVolver.id = 'icoVolver';
    const parrafoVolver = document.createElement('p');
    parrafoVolver.id = 'parrafoVolver';
    parrafoVolver.textContent = 'Volver a Mis Espacios';

    botonVolver.appendChild(icoVolver);
    botonVolver.appendChild(parrafoVolver);

    botonVolver.addEventListener('click', () => {
        page('/myworkspaces'); // Redirige a la página de 'Mis Espacios de Trabajo'
    });

    divConjuntoArriba.appendChild(title);
    divConjuntoArriba.appendChild(botonVolver);

    const hrWorkspace = document.createElement('hr');
    hrWorkspace.id = 'hrWorkspace';

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


    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspace);
    container.appendChild(grid);
    contentDiv.appendChild(container);

    setupHorizontalScroll();
    workspaceDrag();
}
