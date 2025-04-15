export function WorkspaceCard(ws) {


  const card = document.createElement('div');
  card.className = 'workspace-card';

  const header = document.createElement('div');
  header.className = 'workspace-header';

  const name = document.createElement('h3');
  name.textContent = ws.nombre;

  // Menú de opciones
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';

  const dots = document.createElement('i');
  dots.className = 'fa-solid fa-ellipsis';

  const menu = document.createElement('ul');
  menu.className = 'workspace-menu hidden';

  const detalle = document.createElement('li');
  detalle.textContent = 'Ver detalles';

  const renombrar = document.createElement('li');
  renombrar.textContent = 'Cambiar nombre';

  const salir = document.createElement('li');
  salir.textContent = 'Salir del espacio';

  const eliminar = document.createElement('li');
  eliminar.textContent = 'Eliminar espacio';
  eliminar.id = 'eliminarLi';

  menu.appendChild(detalle);
  menu.appendChild(renombrar);
  if (ws.rol !== 'admin') {
      menu.appendChild(salir);
  } else {
      menu.appendChild(eliminar);
  }

  menuContainer.appendChild(dots);
  menuContainer.appendChild(menu);

  // Toggle del menú
  dots.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', () => {
      menu.classList.add('hidden');
  });

  header.appendChild(name);
  header.appendChild(menuContainer);

  const divActividad = document.createElement('div');
  divActividad.id = 'divActividad';


  const actividadIco = document.createElement('i');
  actividadIco.className= 'fa-regular fa-clock';
  actividadIco.id = 'actividadIco';
  const actividad = document.createElement('p');
  actividad.className = 'actividad';
  actividad.textContent = `Última actividad: ${ws.ultimaActividad}`;

  divActividad.appendChild(actividadIco);
  divActividad.appendChild(actividad);

  const horizontalBar = document.createElement('hr');
  horizontalBar.id = 'hrWorkSpace';


  //////////////

  
  const divTableroInfo = document.createElement('div');
  const icoTablero = document.createElement('i');
  icoTablero.id = 'icoTablero';
  const pTablero = document.createElement('p');
  pTablero.textContent = '(tableros activos)'
  divTableroInfo.id = 'divTableroInfo';
  icoTablero.className = 'fa-solid fa-table';

  divTableroInfo.appendChild(icoTablero);
  divTableroInfo.appendChild(pTablero);

  const divMentalMapInfo = document.createElement('div');
  const icoMentalMap = document.createElement('i');
  icoMentalMap.id = 'icoMentalMap';
  const pMentalMap = document.createElement('p');
  pMentalMap.textContent = '(mapas mentales activos)'
  divMentalMapInfo.id = 'divMentalMapInfo';
  icoMentalMap.className = 'fa-regular fa-sticky-note';

  divMentalMapInfo.appendChild(icoMentalMap);
  divMentalMapInfo.appendChild(pMentalMap);


  const divMemberInfo = document.createElement('div');
  const icoMemberInfo = document.createElement('i');
  icoMemberInfo.id = 'icoMentalMap';
  const pMemberInfo = document.createElement('p');
  pMemberInfo.textContent = '(mapas mentales activos)'
  divMemberInfo.id = 'divMentalMapInfo';
  icoMemberInfo.className = 'fa-regular fa-sticky-note';

  const divInfo = document.createElement('div');
  divInfo.id = 'divInfo';
  const icoInfo = document.createElement('i');
  icoInfo.id = 'icoInfo';
  icoInfo.className = 'fa-solid fa-user-group';
  const info = document.createElement('p');
  info.id = 'pInfo';
  info.textContent = `${ws.miembros}`;

  divInfo.appendChild(icoInfo);
  divInfo.appendChild(info);

  const footer = document.createElement('div');
  footer.className = 'workspace-footer';

  const divRol = document.createElement('div');
  divRol.id = 'divRol'; 

  const rol = document.createElement('span');
  rol.id = 'rolSpan';
  rol.className = `rol ${ws.rol}`;
  rol.textContent = ws.rol === 'admin' ? 'Administrador' : 'Miembro';

  divRol.appendChild(rol);

  const enterBtn = document.createElement('button');
  enterBtn.id = 'enter-btn';
  enterBtn.title = 'Entrar';

  const enterIco = document.createElement('i');
  enterIco.className = 'fa-solid fa-right-to-bracket';

  enterBtn.appendChild(enterIco);

  enterBtn.addEventListener('click', () => {
      console.log(`Entrando a workspace ${ws.id}`);
      // page(`/workspace/${ws.id}`);
  });

  footer.appendChild(divInfo);
  footer.appendChild(divRol);
  footer.appendChild(enterBtn);

  card.appendChild(header);
  card.appendChild(divActividad);
  card.appendChild(horizontalBar);
  card.appendChild(divTableroInfo);
  card.appendChild(divMentalMapInfo);
  card.appendChild(footer);

  return card;
}
