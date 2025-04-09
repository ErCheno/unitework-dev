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

  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
    const topNavbar = document.querySelector('.top-navbar-container'); // Seleccionamos el top navbar

    // Cambiar la clase al top navbar cuando el sidebar se abre
    topNavbar.classList.toggle('top-navbar-moved', nav.classList.contains('open'));

    toggleBtn.style.left = nav.classList.contains('open') ? '230px' : '0px';
    icon.className = nav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    hr.style.opacity = nav.classList.contains('open') ? '100%' : '0%';
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

  const dashboardLi = document.createElement('li');
  const dashboardLink = document.createElement('a');
  const iDashboard = document.createElement('i');
  iDashboard.className = 'fa-solid fa-house';
  dashboardLink.href = '#/dashboard';
  dashboardLink.textContent = ' Novedades';
  dashboardLink.prepend(iDashboard);
  dashboardLi.appendChild(dashboardLink);

  // Logout
  const logoutLi = document.createElement('li');
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.id = 'logoutBtn';
  logoutBtn.addEventListener('click', () => logoutUser());
  logoutLi.appendChild(logoutBtn);

  // Añadir todos los <li> al <ul>
  ul.appendChild(buscarLi);

  ul.appendChild(dashboardLi);
  ul.appendChild(logoutLi);

  // Montamos el nav
  nav.appendChild(hr);
  nav.appendChild(ul);

  // Añadir al contenedor
  container.appendChild(toggleBtn);
  container.appendChild(nav);

  return container;
}
