import page from 'page';
import { logoutUser } from '../js/auth.js';

export function Navbar() {
  const container = document.createElement('div');
  container.className = 'sidebar-container';

  const nav = document.createElement('nav');
  nav.className = 'sidebar';
  nav.id = 'sidebar';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggleBtn';
  toggleBtn.className = 'toggle-button';

  // Icono del toggle (hamburguesa o cruz)
  const icon = document.createElement('i');
  icon.className = 'fas fa-bars';
  toggleBtn.appendChild(icon);

  const hr1 = document.createElement('hr');
  const hr2 = document.createElement('hr');
  hr2.id = 'hr2';
  hr1.id = 'hr1';

  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');

    const topNavbar = document.querySelector('.top-navbar-container');
    const mainContent = document.querySelector('.main-content');

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


  // UL para contener los elementos del menú
  const ul = document.createElement('ul');

  // Novedades / Dashboard
  // Crear el li contenedor para la barra de búsqueda
  /*const buscarLi = document.createElement('li');
  buscarLi.id = 'buscarLi';

  const buscarDiv = document.createElement('div');
  buscarDiv.id = 'buscarDiv';

  const buscarIcon = document.createElement('i');
  buscarIcon.className = 'fa-solid fa-magnifying-glass';

  const buscarInput = document.createElement('input');
  buscarInput.type = 'text';
  buscarInput.placeholder = 'Escribe para buscar...';
  buscarInput.className = 'buscar-input';
  

  buscarDiv.appendChild(buscarIcon);
  buscarDiv.appendChild(buscarInput);
  buscarLi.appendChild(buscarDiv); // <li><div><input></div></li>*/
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

  dashboardLinkEspaciosTrabajos.href = '/myworkspaces';
  spanEspaciosTrabajo.textContent = ' Mis espacios de Trabajo';
  dashboardLinkEspaciosTrabajos.appendChild(iDashboardEspaciosTrabajo);
  dashboardLinkEspaciosTrabajos.appendChild(spanEspaciosTrabajo);
  dashboardLiEspaciosTrabajo.appendChild(dashboardLinkEspaciosTrabajos);

  const dashboardLiKanban = document.createElement('li');
  const dashboardLinkKanban = document.createElement('a');
  const iDashboardKanban = document.createElement('i');
  const spanKanban = document.createElement('span');

  iDashboardKanban.className = 'fa-solid fa-columns';
  dashboardLinkKanban.href = '/kanban';
  spanKanban.textContent = ' Tablero Kanban';
  dashboardLinkKanban.appendChild(iDashboardKanban);
  dashboardLinkKanban.appendChild(spanKanban);
  dashboardLiKanban.appendChild(dashboardLinkKanban);


  const dashboardLiMindMap = document.createElement('li');
  const dashboardLinkMindMap = document.createElement('a');
  const iDashboardMindMap = document.createElement('i');
  const spanMindMap = document.createElement('span');

  iDashboardMindMap.className = 'fa-solid fa-diagram-project';
  dashboardLinkMindMap.href = '/mindmap';
  spanMindMap.textContent = ' Mapa mental';
  dashboardLinkMindMap.appendChild(iDashboardMindMap);
  dashboardLinkMindMap.appendChild(spanMindMap);
  dashboardLiMindMap.appendChild(dashboardLinkMindMap);

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

  // Añadir todos los <li> al <ul>
  //ul.appendChild(buscarLi);

  ul.appendChild(dashboardLiNovedades);
  ul.appendChild(dashboardLiEspaciosTrabajo);
  ul.appendChild(dashboardLiKanban);
  ul.appendChild(dashboardLiMindMap);

  // Montamos el nav
  nav.appendChild(hr1);
  nav.appendChild(ul);
  nav.appendChild(hr2);

  nav.appendChild(divDebajo);

  // Añadir al contenedor
  container.appendChild(toggleBtn);
  container.appendChild(nav);

  return container;
}
