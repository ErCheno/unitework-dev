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
  logoImg.alt = 'Logo de UWrk';  // Añadido texto alternativo por accesibilidad
  
  // Título de la app
  const tituloH1 = document.createElement('h1');
  tituloH1.textContent = 'UWrk';
  
  // Añadir el logo y el título dentro del contenedorLogo
  contenedorLogo.appendChild(logoImg);
  contenedorLogo.appendChild(tituloH1);

  // Menú o enlaces
  const menu = document.createElement('ul');
  menu.className = 'menu';

  const homeLink = document.createElement('li');
  const homeAnchor = document.createElement('a');
  homeAnchor.href = '#/home';
  homeAnchor.textContent = 'Inicio';
  homeLink.appendChild(homeAnchor);

  const aboutLink = document.createElement('li');
  const aboutAnchor = document.createElement('a');
  aboutAnchor.href = '#/about';
  aboutAnchor.textContent = 'Acerca de';
  aboutLink.appendChild(aboutAnchor);

  menu.appendChild(homeLink);
  menu.appendChild(aboutLink);

  // Añadir el contenedorLogo y el menú al nav
  nav.appendChild(contenedorLogo);
  nav.appendChild(menu);

  // Añadir el nav al contenedor
  container.appendChild(nav);

  return container;
}
