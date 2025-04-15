import page from 'page';
import { logoutUser } from '../public/js/auth.js';

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

  const hr = document.createElement('hr');
  const hr2 = document.createElement('hr');
  hr2.id = 'hr2';

  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  
    const topNavbar = document.querySelector('.top-navbar-container');
    const mainContent = document.querySelector('.main-content');
  
    if (mainContent) {
      mainContent.classList.toggle('shifted', nav.classList.contains('open'));
    }
  
    topNavbar.classList.toggle('top-navbar-compact', nav.classList.contains('open'));
    topNavbar.classList.toggle('top-navbar-moved', nav.classList.contains('open'));
  
    toggleBtn.style.left = nav.classList.contains('open') ? '230px' : '0px';
    icon.className = nav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  
    hr.style.opacity = nav.classList.contains('open') ? '100%' : '0%';
    hr2.style.opacity = nav.classList.contains('open') ? '100%' : '0%';
  
    document.body.classList.toggle('sidebar-open', nav.classList.contains('open'));
  });
  

  // UL para contener los elementos del menú
  const ul = document.createElement('ul');

  // Novedades / Dashboard
  // Crear el li contenedor para la barra de búsqueda
  const buscarLi = document.createElement('li');
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
  buscarLi.appendChild(buscarDiv); // <li><div><input></div></li>

  const dashboardLiNovedades = document.createElement('li');
  const dashboardLinkNovedades = document.createElement('a');
  const iDashboard = document.createElement('i');
  iDashboard.className = 'fa-solid fa-house';
  dashboardLinkNovedades.href = '/dashboard';
  dashboardLinkNovedades.textContent = ' Novedades';
  dashboardLinkNovedades.prepend(iDashboard);
  dashboardLiNovedades.appendChild(dashboardLinkNovedades);

  const dashboardLiEspaciosTrabajo = document.createElement('li');
  const dashboardLinkEspaciosTrabajos = document.createElement('a');
  const iDashboardEspaciosTrabajo = document.createElement('i');
  iDashboardEspaciosTrabajo.className = 'fa-solid fa-toolbox';
  dashboardLinkEspaciosTrabajos.href = '/myworkspaces';
  dashboardLinkEspaciosTrabajos.textContent = ' Mis espacios de Trabajo';
  dashboardLinkEspaciosTrabajos.prepend(iDashboardEspaciosTrabajo);
  dashboardLiEspaciosTrabajo.appendChild(dashboardLinkEspaciosTrabajos);

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
  ul.appendChild(buscarLi);

  ul.appendChild(dashboardLiNovedades);
  ul.appendChild(dashboardLiEspaciosTrabajo);

  // Montamos el nav
  nav.appendChild(hr);
  nav.appendChild(ul);
  nav.appendChild(hr2);

  nav.appendChild(divDebajo);

  // Añadir al contenedor
  container.appendChild(toggleBtn);
  container.appendChild(nav);

  return container;
}
