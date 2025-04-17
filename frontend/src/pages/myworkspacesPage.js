import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
import { workspaceDrag } from '../components/dragAnimation.js';
import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { showToast } from '../public/js/validator/regex.js';
import { CreateWorkspaceModal } from '../components/popupCrearWorkspace.js';
import { fetchWorkspaces } from '../public/js/workspaces.js';

export async function myWorkspacesPage() {
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
    title.id = 'tituloMyWorkspaces';
    title.textContent = 'Mis espacios de trabajo';

    const botonCrear = document.createElement('button');
    botonCrear.id = 'botonCrear';
    const icoCrear = document.createElement('i');
    icoCrear.className = 'fa-solid fa-square-plus';
    icoCrear.id = 'icoCrear';
    const parrafoCrear = document.createElement('p');
    parrafoCrear.id = 'parrafoCrear';
    parrafoCrear.textContent = 'Crear';

    botonCrear.appendChild(icoCrear);
    botonCrear.appendChild(parrafoCrear);

    botonCrear.addEventListener('click', () => {
        const modal = CreateWorkspaceModal();
        document.body.appendChild(modal);
        modal.show();
    });

    divConjuntoArriba.appendChild(title);
    divConjuntoArriba.appendChild(botonCrear);

    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';

    const grid = document.createElement('div');
    grid.id = 'workspace-list';

    try {
        const usuarioId = localStorage.getItem('usuario_id');
        const workspaces = await fetchWorkspaces(usuarioId);

        workspaces.forEach(ws => {
            const card = WorkspaceCard(ws);
            card.setAttribute('draggable', true);
            card.id = `workspace-${ws.id}`;
            card.classList.add('workspace-draggable');
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar los espacios de trabajo:', error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Hubo un error al cargar tus espacios de trabajo.';
        grid.appendChild(errorMsg);
    }

    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspaces);
    container.appendChild(grid);
    contentDiv.appendChild(container);

    setupHorizontalScroll();
    workspaceDrag();
}





/*
import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
import { workspaceDrag } from '../components/dragAnimation.js';
import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { fetchWorkspaces } from '../public/js/workspaces.js';


export async function myWorkspacesPage() {
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

    const title = document.createElement('h1');
    title.id = 'tituloMyWorkspaces';
    title.textContent = 'Mis espacios de trabajo';

    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';

    const grid = document.createElement('div');
    grid.id = 'workspace-list';

   
    try {
        const usuarioId = localStorage.getItem('usuario_id'); // O de donde lo tengas guardado
        const workspaces = await fetchWorkspaces(usuarioId);
        
        workspaces.forEach(ws => {
            const card = WorkspaceCard(ws);
            card.setAttribute('draggable', true);
            card.id = `workspace-${ws.id}`;
            card.classList.add('workspace-draggable');
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar los espacios de trabajo:', error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Hubo un error al cargar tus espacios de trabajo.';
        grid.appendChild(errorMsg);
    }
    
    

    container.appendChild(title);
    container.appendChild(hrWorkspaces);
    container.appendChild(grid);
    contentDiv.appendChild(container);

    setupHorizontalScroll();
    workspaceDrag(); // ← módulo importado
}


*/