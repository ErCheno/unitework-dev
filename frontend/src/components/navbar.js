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

    toggleBtn.style.left = nav.classList.contains('open') ? '230px' : '0px';
    icon.className = nav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    hr.style.opacity = nav.classList.contains('open') ? '100%' : '0%';
  });

  // UL para contener los elementos del menú
  const ul = document.createElement('ul');

  // Novedades / Dashboard
  const buscarLi = document.createElement('li');

  // Crear el botón "Buscar"
  const buscarBtn = document.createElement('button');
  buscarBtn.textContent = 'Buscar';
  buscarLi.appendChild(buscarBtn);

  // Crear el input (pero no lo añadimos aún)
  const buscarInput = document.createElement('input');
  buscarInput.type = 'text';
  buscarInput.placeholder = 'Escribe para buscar...';
  buscarInput.style.display = 'none'; // Ocultarlo al principio

  // Añadir el input al li, pero inicialmente no es visible
  buscarLi.appendChild(buscarInput);

  // Funcionalidad del botón de "Buscar"
  buscarBtn.addEventListener('click', () => {
    // Alternamos la visibilidad del input
    if (buscarInput.style.display === 'none') {
      buscarInput.style.display = 'block'; // Muestra el input
      buscarInput.focus(); // Opcional: darle foco al input cuando aparece
    } else {
      buscarInput.style.display = 'none'; // Ocultar el input si ya está visible
    }
  });

  // Suponiendo que tienes un contenedor de lista donde añadirlo

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
  ul.appendChild(dashboardLi);
  ul.appendChild(logoutLi);
  ul.appendChild(buscarLi);

  // Montamos el nav
  nav.appendChild(hr);
  nav.appendChild(ul);

  // Añadir al contenedor
  container.appendChild(toggleBtn);
  container.appendChild(nav);

  return container;
}
