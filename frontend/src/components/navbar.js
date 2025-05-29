import page from 'page';
import { logoutUser } from '../js/auth.js';
import { fetchWorkspaces } from '../js/workspaces.js';
import { cleanupView } from '../../public/js/cleanup.js';
import { fetchBoards } from '../js/board.js';
import { fetchMindMaps } from '../js/mindMap.js';

export function Navbar() {


  let contentDiv = document.getElementById('content');
  if (!contentDiv) {
    contentDiv = document.createElement('div');
    contentDiv.id = 'content';
    document.body.appendChild(contentDiv);
  }
  contentDiv.textContent = '';

  const content = document.createElement('div');
  content.id = 'container';

  const container = document.createElement('div');
  container.className = 'sidebar-container';

  const nav = document.createElement('nav');
  nav.className = 'sidebar';
  nav.id = 'sidebar';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggleBtn';
  toggleBtn.className = 'toggle-button';
  toggleBtn.title = 'Haz clic para abrir el menú';

  // Icono del toggle (hamburguesa o cruz)
  const icon = document.createElement('i');
  icon.className = 'fas fa-bars';
  toggleBtn.appendChild(icon);

  const hr1 = document.createElement('hr');
  const hr2 = document.createElement('hr');
  hr2.id = 'hr2';
  hr1.id = 'hr1';

  const ul = document.createElement('ul');

  const dashboardLiNovedades = document.createElement('li');
  const dashboardLinkNovedades = document.createElement('a');
  const iDashboard = document.createElement('i');
  iDashboard.title = 'Novedades';
  const spanNovedades = document.createElement('span');

  iDashboard.className = 'fa-solid fa-house';
  dashboardLinkNovedades.href = '/dashboard';
  spanNovedades.textContent = ' Novedades';
  dashboardLinkNovedades.appendChild(iDashboard);
  dashboardLinkNovedades.appendChild(spanNovedades);
  dashboardLiNovedades.appendChild(dashboardLinkNovedades);

  const dashboardLiEspaciosTrabajo = document.createElement('li');
  const dashboardLinkEspaciosTrabajos = document.createElement('a');
  const iDashboardEspaciosTrabajo = document.createElement('i');
  const spanEspaciosTrabajo = document.createElement('span');

  iDashboardEspaciosTrabajo.className = 'fa-solid fa-toolbox';
  iDashboardEspaciosTrabajo.title = 'Mis espacios de Trabajo';

  const workspaceDropdown = document.createElement('div');
  workspaceDropdown.className = 'submenu-dropdown-navbar hidden';

  const arrow = document.createElement('div');
  arrow.className = 'popup-arrow-navbar';
  workspaceDropdown.appendChild(arrow);

  dashboardLinkEspaciosTrabajos.href = '#';
  spanEspaciosTrabajo.textContent = ' Mis espacios de Trabajo';


  function updateDropdownPosition() {
    const isOpen = nav.classList.contains('open');
    const leftPosition = isOpen ? 260 : 60; // Ancho sidebar abierto o cerrado
    const arrowPosition = isOpen ? 260 : 60; // Ancho sidebar abierto o cerrado
    workspaceDropdown.style.left = leftPosition + 'px';
    arrow.style.left = arrowPosition + 'px';
    // Ajusta top si quieres que aparezca más abajo o alineado con toggleBtn
  }


  // Llama a esta función cada vez que cambias el estado del sidebar (toggle)

  dashboardLinkEspaciosTrabajos.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Click detectado en Mis espacios de trabajo');
    workspaceDropdown.classList.toggle('hidden');
    updateDropdownPosition();

    try {
      const workspaces = await fetchWorkspaces();
      console.log(workspaces);

      workspaceDropdown.innerHTML = ''; // limpia contenido
      workspaceDropdown.appendChild(arrow); // vuelve a añadir el arrow

      if (workspaces.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No tienes espacios de trabajo.';
        emptyMsg.classList.add('empty-msg');
        workspaceDropdown.appendChild(emptyMsg);
      } else {
        workspaces.forEach(ws => {
          const wsLink = document.createElement('a');
          wsLink.className = 'wsLink';
          wsLink.href = `/workspace/${ws.id}`;
          wsLink.textContent = ws.nombre;
          workspaceDropdown.appendChild(wsLink);
        });
      }

    } catch (error) {
      workspaceDropdown.innerHTML = ''; // Limpia por si hay contenido antes
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error al cargar los espacios.';
      console.error(error);
      errorMsg.classList.add('error-msg');
      workspaceDropdown.appendChild(errorMsg);
    }
  });

  dashboardLinkEspaciosTrabajos.addEventListener('dblclick', (e) => {
    e.preventDefault(); // Opcional, para prevenir comportamiento por defecto
    page('/myworkspaces'); // redirige a la página deseada
  });

  dashboardLinkEspaciosTrabajos.addEventListener('click', (e) => {
    e.preventDefault();
    workspaceDropdown.classList.toggle('show');
  });
  // Cerrar menú si se hace clic fuera
  document.addEventListener('click', (e) => {
    if (!dashboardLinkEspaciosTrabajos.contains(e.target) && !workspaceDropdown.contains(e.target)) {
      workspaceDropdown.classList.add('hidden');
    }
  });

  dashboardLinkEspaciosTrabajos.appendChild(iDashboardEspaciosTrabajo);
  dashboardLinkEspaciosTrabajos.appendChild(spanEspaciosTrabajo);
  dashboardLiEspaciosTrabajo.appendChild(dashboardLinkEspaciosTrabajos);

  // Crear dropdown para tableros Kanban
  const kanbanDropdown = document.createElement('div');
  kanbanDropdown.className = 'kanban-submenu-dropdown-navbar hidden';

  const kanbanArrow = document.createElement('div');
  kanbanArrow.className = 'popup-arrow-navbar-kanban';
  kanbanDropdown.appendChild(kanbanArrow);

  const dashboardLiKanban = document.createElement('li');
  const dashboardLinkKanban = document.createElement('a');
  const iDashboardKanban = document.createElement('i');
  const spanKanban = document.createElement('span');

  iDashboardKanban.className = 'fa-solid fa-columns';
  iDashboardKanban.title = 'Mis tableros Kanban';

  dashboardLinkKanban.href = '#'; // para que no navegue automáticamente
  spanKanban.textContent = ' Tableros Kanban';

  dashboardLinkKanban.appendChild(iDashboardKanban);
  dashboardLinkKanban.appendChild(spanKanban);
  dashboardLiKanban.appendChild(dashboardLinkKanban);

  // Función para actualizar posición del dropdown Kanban
  function updateKanbanDropdownPosition() {
    const isOpen = nav.classList.contains('open');
    const leftPosition = isOpen ? 260 : 70;
    const arrowPosition = isOpen ? 260 : 70;
    kanbanDropdown.style.left = leftPosition + 'px';
    kanbanArrow.style.left = arrowPosition + 'px';
  }
  dashboardLinkKanban.addEventListener('click', async (e) => {
    e.preventDefault();

    const yaVisible = !kanbanDropdown.classList.contains('hidden');
    kanbanDropdown.classList.add('hidden');
    if (yaVisible) return;

    console.log('Click detectado en Tableros Kanban');

    kanbanDropdown.innerHTML = '';

    // Creamos el arrow una sola vez
    kanbanArrow.className = 'popup-arrow-navbar-kanban';
    kanbanDropdown.appendChild(kanbanArrow);

    try {
      const workspaces = await fetchWorkspaces();
      const allBoards = [];

      for (const ws of workspaces) {
        try {
          const boards = await fetchBoards(ws.id);
          allBoards.push(...boards);
        } catch (error) {
          console.error(`Error al cargar tableros del workspace ${ws.id}:`, error);
        }
      }

      kanbanDropdown.innerHTML = '';
      kanbanDropdown.className = 'kanban-submenu-dropdown-navbar visible';

      // Volvemos a añadir el arrow después de limpiar el contenido
      kanbanDropdown.appendChild(kanbanArrow);

      if (allBoards.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No tienes tableros Kanban.';
        emptyMsg.classList.add('empty-msg');
        kanbanDropdown.appendChild(emptyMsg);
      } else {
        allBoards.forEach(board => {
          const boardLink = document.createElement('a');
          boardLink.className = 'boardLink';
          boardLink.href = `/board/${board.id}`;
          boardLink.textContent = board.nombre;
          kanbanDropdown.appendChild(boardLink);
        });
      }

      kanbanDropdown.classList.remove('hidden');

      // 🔥 ACTUALIZA POSICIÓN después de construir el contenido
      updateKanbanDropdownPosition();

    } catch (error) {
      kanbanDropdown.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error al cargar los tableros.';
      errorMsg.classList.add('error-msg');
      kanbanDropdown.appendChild(errorMsg);
      console.error(error);
    }
  });


  updateKanbanDropdownPosition();



  // Cerrar menú si clic fuera
  document.addEventListener('click', (e) => {
    if (!dashboardLinkKanban.contains(e.target) && !kanbanDropdown.contains(e.target)) {
      kanbanDropdown.classList.add('hidden'); // oculta el menú
      // También oculta todos los dropdowns anidados de tableros
      kanbanDropdown.querySelectorAll('.kanban-submenu-dropdown-navbar').forEach(el => {
        el.classList.add('hidden');
      });
    }
  });


  // Añadir dropdown al contenedor
  container.appendChild(kanbanDropdown);
  container.appendChild(workspaceDropdown);

  // Añadir li Kanban al ul

  // Crear dropdown para mapas mentales
  const mindmapDropdown = document.createElement('div');
  mindmapDropdown.className = 'mindmap-submenu-dropdown-navbar hidden';

  const mindmapArrow = document.createElement('div');
  mindmapArrow.className = 'popup-arrow-navbar-mindmap';
  mindmapDropdown.appendChild(mindmapArrow);

  const dashboardLiMindmap = document.createElement('li');
  const dashboardLinkMindmap = document.createElement('a');
  const iDashboardMindmap = document.createElement('i');
  const spanMindmap = document.createElement('span');

  iDashboardMindmap.className = 'fa-solid fa-project-diagram'; // icono de mapas mentales
  iDashboardMindmap.title = 'Mis mapas mentales';

  dashboardLinkMindmap.href = '#'; // para que no navegue automáticamente
  spanMindmap.textContent = ' Mapas Mentales';

  dashboardLinkMindmap.appendChild(iDashboardMindmap);
  dashboardLinkMindmap.appendChild(spanMindmap);
  dashboardLiMindmap.appendChild(dashboardLinkMindmap);

  // Función para actualizar posición del dropdown Mapas Mentales
  function updateMindmapDropdownPosition() {
    const isOpen = nav.classList.contains('open');
    const leftPosition = isOpen ? 260 : 70;
    const arrowPosition = isOpen ? 260 : 70;
    mindmapDropdown.style.left = leftPosition + 'px';
    mindmapArrow.style.left = arrowPosition + 'px';
  }

  dashboardLinkMindmap.addEventListener('click', async (e) => {
    e.preventDefault();

    const yaVisible = !mindmapDropdown.classList.contains('hidden');
    mindmapDropdown.classList.add('hidden');
    if (yaVisible) return;

    console.log('Click detectado en Mapas Mentales');

    mindmapDropdown.innerHTML = '';

    // Creamos el arrow una sola vez
    mindmapArrow.className = 'popup-arrow-navbar-mindmap';
    mindmapDropdown.appendChild(mindmapArrow);

    try {
      const workspaces = await fetchWorkspaces();
      const allMindmaps = [];

      for (const ws of workspaces) {
        try {
          const mindmaps = await fetchMindMaps(ws.id); // Cambia fetchBoards por fetchMindmaps
          allMindmaps.push(...mindmaps);
        } catch (error) {
          console.error(`Error al cargar mapas mentales del workspace ${ws.id}:`, error);
        }
      }

      mindmapDropdown.innerHTML = '';
      mindmapDropdown.className = 'mindmap-submenu-dropdown-navbar visible';

      // Volvemos a añadir el arrow después de limpiar el contenido
      mindmapDropdown.appendChild(mindmapArrow);

      if (allMindmaps.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No tienes mapas mentales.';
        emptyMsg.classList.add('empty-msg');
        mindmapDropdown.appendChild(emptyMsg);
      } else {
        allMindmaps.forEach(mindmap => {
          const mindmapLink = document.createElement('a');
          mindmapLink.className = 'mindmapLink';
          mindmapLink.href = `/mindmap/${mindmap.id}`;
          mindmapLink.textContent = mindmap.titulo;
          mindmapDropdown.appendChild(mindmapLink);
        });
      }

      mindmapDropdown.classList.remove('hidden');

      // 🔥 ACTUALIZA POSICIÓN después de construir el contenido
      updateMindmapDropdownPosition();

    } catch (error) {
      mindmapDropdown.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error al cargar los mapas mentales.';
      errorMsg.classList.add('error-msg');
      mindmapDropdown.appendChild(errorMsg);
      console.error(error);
    }
  });

  updateMindmapDropdownPosition();

  // Cerrar menú si clic fuera
  document.addEventListener('click', (e) => {
    if (!dashboardLinkMindmap.contains(e.target) && !mindmapDropdown.contains(e.target)) {
      mindmapDropdown.classList.add('hidden'); // oculta el menú
      // También oculta todos los dropdowns anidados de mapas mentales
      mindmapDropdown.querySelectorAll('.mindmap-submenu-dropdown-navbar').forEach(el => {
        el.classList.add('hidden');
      });
    }
  });

  // Añadir dropdown al contenedor
  container.appendChild(mindmapDropdown);
  // container.appendChild(workspaceDropdown); // Esto ya debe estar en tu código

  // Logout
  const divDebajo = document.createElement('div');
  divDebajo.id = 'divDebajo';

  const logoutIco = document.createElement('i');
  logoutIco.id = 'logoutIco'
  logoutIco.className = 'fa-solid fa-right-from-bracket';
  logoutIco.addEventListener('click', () => logoutUser());

  const configIco = document.createElement('i');
  configIco.id = 'configIco'
  configIco.className = 'fa-solid fa-gear';

  divDebajo.appendChild(logoutIco);
  divDebajo.appendChild(configIco);

  ul.appendChild(dashboardLiNovedades);
  ul.appendChild(dashboardLiEspaciosTrabajo);
  ul.appendChild(dashboardLiKanban);
  ul.appendChild(dashboardLiMindmap);

  // Montamos el nav
  nav.appendChild(hr1);
  nav.appendChild(ul);
  nav.appendChild(hr2);

  nav.appendChild(divDebajo);
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');

    const topNavbar = document.querySelector('.top-navbar-container');
    const mainContent = document.querySelector('.main-content');
    updateDropdownPosition();

    if (mainContent) {
      mainContent.classList.toggle('shifted', nav.classList.contains('open'));
    }

    topNavbar.classList.toggle('top-navbar-compact', nav.classList.contains('open'));
    topNavbar.classList.toggle('top-navbar-moved', nav.classList.contains('open'));

    toggleBtn.style.left = nav.classList.contains('open') ? '215px' : '10px';
    icon.className = nav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';

    hr1.style.opacity = nav.classList.contains('open') ? '100%' : '0%';
    hr2.style.opacity = nav.classList.contains('open') ? '100%' : '0%';

    document.body.classList.toggle('sidebar-open', nav.classList.contains('open'));
  });
  // Añadir al contenedor
  container.appendChild(toggleBtn);
  container.appendChild(nav);

  return container;
}
