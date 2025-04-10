import page from 'page';

export function TopNavbar() {
  const container = document.createElement('div');
  container.className = 'top-navbar-container';

  const nav = document.createElement('nav');
  nav.className = 'top-navbar';
  nav.id = 'top-navbar';

  // Contenedor del logo o nombre de la app
  const contenedorLogo = document.createElement('div');
  contenedorLogo.className = 'logo';

  // Logo de la app
  const logoImg = document.createElement('img');
  logoImg.src = 'http://localhost/UniteWork/unitework-dev/assets/img/poff.png';
  logoImg.alt = 'Logo de UWrk';  // Se ha añadido texto alternativo para la accesibilidad

  // Este es el título de la app
  const tituloH1 = document.createElement('h1');
  tituloH1.textContent = 'UWrk';

  contenedorLogo.appendChild(logoImg);
  contenedorLogo.appendChild(tituloH1);

  // Menú o enlaces
  const menu = document.createElement('ul');
  menu.className = 'menu';

  const userIcon = document.createElement('i');
  userIcon.className = 'fa-regular fa-user';

  const userLi = document.createElement('li');
  userLi.id = 'user';

  const userA = document.createElement('a');
  userA.href = '#';
  userA.appendChild(userIcon);
  userLi.appendChild(userA);

  const notifIcon = document.createElement('i');
  notifIcon.className = 'fa-regular fa-bell';

  const notifLi = document.createElement('li');
  notifLi.id = 'notif';

  const notifA = document.createElement('a');
  notifA.href = '#';
  notifA.appendChild(notifIcon);
  notifLi.appendChild(notifA);


  const dasboardLi = document.createElement('li');
  const dashboardA = document.createElement('a');
  dashboardA.href = '#/dashboard';
  dashboardA.textContent = 'Novedades';
  dasboardLi.appendChild(dashboardA);

  const kanbanLi = document.createElement('li');
  const kanbanA = document.createElement('a');
  kanbanA.href = '#/kanban';
  kanbanA.textContent = 'Tablero Kanban';
  kanbanLi.appendChild(kanbanA);

  const gruposLi = document.createElement('li');
  const gruposA = document.createElement('a');
  gruposA.href = '#/groups';
  gruposA.textContent = 'Grupos';
  gruposLi.appendChild(gruposA);

  const mapasmentalesLi = document.createElement('li');
  const mapasmentalesA = document.createElement('a');
  mapasmentalesA.href = '#/kanban';
  mapasmentalesA.textContent = 'Tablero Kanban';
  mapasmentalesLi.appendChild(mapasmentalesA);


  menu.appendChild(dasboardLi);
  menu.appendChild(kanbanLi);
  menu.appendChild(gruposLi);
  menu.appendChild(mapasmentalesLi);



  menu.appendChild(notifLi)
  menu.appendChild(userLi)

  // Añadir el contenedorLogo y el menú al nav
  nav.appendChild(contenedorLogo);
  nav.appendChild(menu);

  // Añadir el nav al contenedor
  container.appendChild(nav);

  return container;
}
