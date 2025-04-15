export function createWorkspaceCard(workspace) {
  const card = document.createElement('div');
  card.className = 'workspace-card';

  // Header
  const header = document.createElement('div');
  header.className = 'workspace-header';

  const title = document.createElement('h3');
  title.textContent = workspace.nombre;

  const dots = document.createElement('span');
  dots.className = 'dots';
  dots.textContent = '⋮';

  header.appendChild(title);
  header.appendChild(dots);

  // Info
  const actividad = document.createElement('p');
  actividad.className = 'actividad';
  actividad.textContent = `Última actividad: ${workspace.ultimaActividad}`;

  const info = document.createElement('p');
  info.className = 'info';
  info.textContent = `Tableros: ${workspace.tableros}, Mapas: ${workspace.mapas}`;

  // Footer
  const footer = document.createElement('div');
  footer.className = 'workspace-footer';

  const miembros = document.createElement('span');
  miembros.className = 'miembros';
  miembros.textContent = `Miembros: ${workspace.miembros}`;

  const rol = document.createElement('span');
  rol.className = `rol ${workspace.rol === 'Administrador' ? 'admin' : 'member'}`;
  rol.textContent = workspace.rol;

  const entrarBtn = document.createElement('button');
  entrarBtn.className = 'enter-btn';
  entrarBtn.textContent = '→';
  entrarBtn.addEventListener('click', () => {
    page(`/workspace/${workspace.id}`);
  });

  footer.appendChild(miembros);
  footer.appendChild(rol);
  footer.appendChild(entrarBtn);

  // Estructura final
  card.appendChild(header);
  card.appendChild(actividad);
  card.appendChild(info);
  card.appendChild(footer);

  return card;
}



export function WorkspaceCard(ws) {
  const card = document.createElement('div');
  card.className = 'workspace-card';

  const header = document.createElement('div');
  header.className = 'workspace-header';

  const name = document.createElement('h3');
  name.textContent = ws.nombre;

  const dots = document.createElement('span');
  dots.className = 'dots';
  dots.textContent = '⋮';

  header.appendChild(name);
  header.appendChild(dots);

  const actividad = document.createElement('p');
  actividad.className = 'actividad';
  actividad.textContent = `Última actividad: ${ws.ultimaActividad}`;

  const info = document.createElement('p');
  info.className = 'info';
  info.textContent = `${ws.miembros} miembros`;

  const footer = document.createElement('div');
  footer.className = 'workspace-footer';

  const rol = document.createElement('span');
  rol.className = `rol ${ws.rol}`;
  rol.textContent = ws.rol === 'admin' ? 'Administrador' : 'Miembro';

  const enterBtn = document.createElement('button');
  enterBtn.className = 'enter-btn';
  enterBtn.textContent = '→';
  enterBtn.title = 'Entrar';

  enterBtn.addEventListener('click', () => {
      console.log(`Entrando a workspace ${ws.id}`);
      // Redirigir a la vista del workspace
      // page(`/workspace/${ws.id}`);
  });

  footer.appendChild(rol);
  footer.appendChild(enterBtn);

  card.appendChild(header);
  card.appendChild(actividad);
  card.appendChild(info);
  card.appendChild(footer);

  return card;
}

