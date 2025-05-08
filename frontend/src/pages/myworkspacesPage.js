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
import { setupSortable } from '../components/dragAnimation.js';
import { scrollHorizontal } from '../components/dragAnimation.js';
import { socketGetWorkspaces } from '../../public/js/socketsEvents.js';

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

    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolver';
    const icoVolver = document.createElement('i');
    icoVolver.className = 'fa-solid fa-house';
    icoVolver.id = 'icoVolver';
    const parrafoVolver = document.createElement('p');
    parrafoVolver.id = 'parrafoVolver';
    parrafoVolver.textContent = 'Volver al inicio';
    botonVolver.append(icoVolver, parrafoVolver);

    botonVolver.addEventListener('click', () => page('/dashboard'));

    const botonRecarga = document.createElement('button');
    botonRecarga.id = 'botonRecarga';
    botonRecarga.title = 'Recargar Espacios de trabajo'
    const icoRecarga = document.createElement('i');
    icoRecarga.className = 'fa-solid fa-rotate-right';
    icoRecarga.id = 'icoRecarga';

    botonRecarga.append(icoRecarga);
    botonRecarga.addEventListener('click', () => {
        renderWorkspaces(grid);
    });

    divConjuntoArriba.appendChild(title);


    const divBotonesArriba = document.createElement('div');
    divBotonesArriba.id = 'divBotonesArriba';

    divBotonesArriba.appendChild(botonRecarga);
    divBotonesArriba.appendChild(botonVolver);
    divBotonesArriba.appendChild(botonCrear);

    divConjuntoArriba.appendChild(divBotonesArriba);

    const hrWorkspaces = document.createElement('hr');
    hrWorkspaces.id = 'hrMyWorkspaces';

    const grid = document.createElement('div');
    grid.id = 'workspace-list';
    await renderWorkspaces(grid);


    container.appendChild(divConjuntoArriba);
    container.appendChild(hrWorkspaces);

    scrollHorizontal(grid);

    container.appendChild(grid);
    contentDiv.appendChild(container);

    setupSortable('workspace-list', '.workspace-draggable', (evt) => {
        console.log('Espacio de trabajo movido de', evt.oldIndex, 'a', evt.newIndex);
    });
    
    socketGetWorkspaces();

    
}


export async function renderWorkspaces(grid) {
  try {
    const workspaces = await fetchWorkspaces();
    const currentIds = new Set([...grid.children].map(card => card.dataset.id));

    const newIds = new Set(workspaces.map(ws => String(ws.id)));

    // Eliminar los que ya no están
    [...grid.children].forEach(card => {
      if (!newIds.has(card.dataset.id)) {
        grid.removeChild(card);
      }
    });

    // Agregar nuevos
    workspaces.forEach(ws => {
      const id = String(ws.id);
      if (!currentIds.has(id)) {
        const card = WorkspaceCard(ws);
        card.setAttribute('draggable', true);
        card.dataset.id = id;
        card.classList.add('workspace-draggable');
        grid.appendChild(card);
      }
    });

    // Si no hay ninguno
    if (workspaces.length === 0 && !grid.querySelector('.no-workspaces-msg')) {
      const noWorkspacesMsg = document.createElement('p');
      noWorkspacesMsg.textContent = '¡Empieza creando un proyecto!';
      noWorkspacesMsg.classList.add('no-workspaces-msg');
      grid.appendChild(noWorkspacesMsg);
    } else if (workspaces.length > 0) {
      const msg = grid.querySelector('.no-workspaces-msg');
      if (msg) msg.remove();
    }

  } catch (error) {
    showToast('Error al cargar los espacios de trabajo: ' + error, 'error');
  }
}