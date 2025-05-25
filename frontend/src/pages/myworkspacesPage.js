import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';
//import { workspaceDrag } from '../components/dragAnimation.js';
//import { setupHorizontalScroll } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import { CreateWorkspaceModal } from '../components/popupCrearWorkspace.js';
import { fetchWorkspaces } from '../js/workspaces.js';
import { setupSortable } from '../components/dragAnimation.js';
import { scrollHorizontal } from '../components/dragAnimation.js';
import { socketGetWorkspaces } from '../js/socketsEvents.js';

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
    const modal = CreateWorkspaceModal(botonCrear);
    document.body.appendChild(modal);
  });

  const botonVolver = document.createElement('button');
  botonVolver.id = 'botonVolver';
  const icoVolver = document.createElement('i');
  icoVolver.className = 'fa-solid fa-house';
  icoVolver.id = 'icoVolver';
  const parrafoVolver = document.createElement('p');
  parrafoVolver.id = 'parrafoVolver';
  parrafoVolver.textContent = 'Inicio';
  botonVolver.append(icoVolver, parrafoVolver);

  botonVolver.addEventListener('click', () => page('/dashboard'));

  const botonRecarga = document.createElement('button');
  botonRecarga.id = 'botonRecarga';
  botonRecarga.title = 'Recargar Espacios de trabajo'
  const icoRecarga = document.createElement('i');
  icoRecarga.className = 'fa-solid fa-rotate-right';
  icoRecarga.id = 'icoRecarga';

  botonRecarga.append(icoRecarga);



  divConjuntoArriba.appendChild(title);

  const botonFiltro = document.createElement('button');
  botonFiltro.id = 'botonFiltro';
  botonFiltro.title = 'Filtra Espacios de trabajo'
  const icoFiltro = document.createElement('i');
  icoFiltro.className = 'fa-solid fa-sort';
  icoFiltro.id = 'icoFiltro';

  botonFiltro.append(icoFiltro);
  const divBotonesArriba = document.createElement('div');
  divBotonesArriba.id = 'divBotonesArriba';

  const lineaVertical = document.createElement('div');
  lineaVertical.id = 'lineaVertical';


  divBotonesArriba.appendChild(botonRecarga);
  divBotonesArriba.appendChild(botonFiltro);
  divBotonesArriba.appendChild(lineaVertical);
  divBotonesArriba.appendChild(botonVolver);
  divBotonesArriba.appendChild(botonCrear);

  divConjuntoArriba.appendChild(divBotonesArriba);

  const hrWorkspaces = document.createElement('hr');
  hrWorkspaces.id = 'hrMyWorkspaces';

  const grid = document.createElement('div');
  grid.id = 'workspace-list';

  const workspaces = await fetchWorkspaces();

  await renderWorkspaces(grid, workspaces);


  container.appendChild(divConjuntoArriba);
  container.appendChild(hrWorkspaces);

  scrollHorizontal(grid);

  container.appendChild(grid);
  contentDiv.appendChild(container);

  setupSortable('workspace-list', '.workspace-draggable', (evt) => {
  });

  botonFiltro.addEventListener('click', () => {
    crearFiltroPopup(grid);
  });

  botonRecarga.addEventListener('click', async () => {
    renderWorkspaces(grid, workspaces);
  });

  socketGetWorkspaces();


}


export async function renderWorkspaces(grid, workspaces = []) {
  try {
    grid.innerHTML = '';


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
    console.error('Error al cargar los espacios de trabajo: ' + error);
  }
}
function crearFiltroPopup(grid) {
  const popupExistente = document.getElementById('popupFiltro');
  if (popupExistente) popupExistente.remove();

  const popupFiltro = document.createElement('div');
  popupFiltro.id = 'popupFiltro';

  const flecha = document.createElement('div');
  flecha.className = 'popup-flecha';

  popupFiltro.classList.add('mostrar');
  popupFiltro.classList.remove('ocultar');

  setTimeout(() => {
    popupFiltro.classList.add('animate-popup');
  }, 50);

  // Aquí defines el texto, icono y valor real de orden para el backend
  const opciones = [
    { texto: 'Alfabéticamente A-Z', icono: 'fa-sort-alpha-down', valor: 'nombre_asc' },
    { texto: 'Alfabéticamente Z-A', icono: 'fa-sort-alpha-up', valor: 'nombre_desc' },
    { texto: 'Cantidad Kanban (mayor a menor)', icono: 'fa-table', valor: 'kanban' },
    { texto: 'Cantidad Mapas (mayor a menor)', icono: 'fa-brain', valor: 'mapas' },
    { texto: 'Favoritos', icono: 'fa-star', valor: 'favoritos' }
  ];

  opciones.forEach(({ texto, icono, valor }) => {
    const opcion = document.createElement('div');
    opcion.id = 'opcionFiltro';

    opcion.onmouseenter = () => opcion.style.backgroundColor = '#f0f0f0';
    opcion.onmouseleave = () => opcion.style.backgroundColor = 'transparent';

    const icon = document.createElement('i');
    icon.className = `fa-solid ${icono}`;

    opcion.appendChild(icon);
    opcion.appendChild(document.createTextNode(' ' + texto));

    opcion.onclick = async () => {
      console.log('Filtro seleccionado:', valor);
      const workspaces = await fetchWorkspaces(valor); // <- Aquí haces la llamada real con el filtro
      console.log(workspaces);
      await renderWorkspaces(grid, workspaces);
      cerrarPopup();
    };

    popupFiltro.appendChild(opcion);
  });

  const botonFiltro = document.getElementById('botonFiltro');
  const rect = botonFiltro.getBoundingClientRect();
  const popupWidth = 300;

  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 8;

  if (left + popupWidth > window.innerWidth - 10) {
    left = window.innerWidth - popupWidth - 10;
  }

  popupFiltro.style.top = `${top}px`;
  popupFiltro.style.left = `${left}px`;
  popupFiltro.style.width = `${popupWidth}px`;

  document.body.appendChild(popupFiltro);

  function cerrarPopup() {

    setTimeout(() => {
      if (popupFiltro.parentNode) {
        popupFiltro.remove();
      }
    }, 100);


    if (popupFiltro && popupFiltro.parentNode) {
      popupFiltro.classList.remove('animate-popup');
      popupFiltro.classList.add('fade-out');
      popupFiltro.classList.remove('mostrar');
      popupFiltro.classList.add('ocultar');

      popupFiltro.addEventListener('animationend', () => {
        popupFiltro.remove();
      }, { once: true });
      document.removeEventListener('click', manejarClickFuera);
    }
  }

  popupFiltro.appendChild(flecha);

  function manejarClickFuera(event) {
    if (!popupFiltro.contains(event.target) && event.target !== botonFiltro) {
      cerrarPopup();
    }
  }

  setTimeout(() => {
    document.addEventListener('click', manejarClickFuera);
  }, 0);
}
