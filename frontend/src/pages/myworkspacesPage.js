import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
import { workspaceDrag } from '../components/dragAnimation.js';
import { setupHorizontalScroll } from '../components/dragAnimation.js';

export function myWorkspacesPage() {
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

    const workspaces = [
        { id: 1, nombre: '1', ultimaActividad: 'Hace 2 días', miembros: 5, rol: 'admin' },
        { id: 2, nombre: '2', ultimaActividad: 'Hoy', miembros: 12, rol: 'member' },
        { id: 3, nombre: '3', ultimaActividad: 'Hace 1 semana', miembros: 3, rol: 'admin' },
        { id: 4, nombre: '4', ultimaActividad: 'Ayer', miembros: 8, rol: 'member' },
        { id: 5, nombre: '5', ultimaActividad: 'Hace 2 días', miembros: 5, rol: 'admin' },
        { id: 6, nombre: '6', ultimaActividad: 'Hoy', miembros: 12, rol: 'member' },
        { id: 7, nombre: '7', ultimaActividad: 'Hace 1 semana', miembros: 3, rol: 'admin' },
        { id: 8, nombre: '8', ultimaActividad: 'Ayer', miembros: 8, rol: 'member' },
        { id: 9, nombre: '9', ultimaActividad: 'Hace 2 días', miembros: 5, rol: 'admin' },
        { id: 10, nombre: '10', ultimaActividad: 'Hoy', miembros: 12, rol: 'member' },
        { id: 11, nombre: '11', ultimaActividad: 'Hace 1 semana', miembros: 3, rol: 'admin' },
        { id: 12, nombre: '12', ultimaActividad: 'Ayer', miembros: 8, rol: 'member' }
    ];

    workspaces.forEach(ws => {
        const card = WorkspaceCard(ws);
        card.setAttribute('draggable', true); // Aseguramos que cada card es arrastrable
        card.id = `workspace-${ws.id}`;
        card.classList.add('workspace-draggable');
        grid.appendChild(card);
    });
    
    

    container.appendChild(title);
    container.appendChild(hrWorkspaces);
    container.appendChild(grid);
    contentDiv.appendChild(container);

    setupHorizontalScroll();
    workspaceDrag(); // ← módulo importado
}


