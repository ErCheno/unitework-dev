export function MindMapCard(map) {
  const card = document.createElement('div');
  card.className = 'mindmap-card'; // Puedes cambiar a 'mindmap-card' si quieres un estilo diferente
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir mapa mental: ${map.titulo}`);
  card.classList.add(obtenerClaseColorPersistente(map.id));

  const mapHeader = document.createElement('div');
  mapHeader.className = 'mindmap-header';

  const title = document.createElement('h3');
  title.className = 'mindmap-title';
  title.textContent = map.titulo || 'Mapa sin título';

  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';

  const icoMap = document.createElement('i');
  icoMap.className = 'fa-solid fa-ellipsis';
  icoMap.id = 'icoMindMap';

  const menu = document.createElement('ul');
  menu.className = 'mindmap-menu hidden';

  const detalle = document.createElement('li');
  detalle.textContent = 'Ver detalles';

  const eliminar = document.createElement('li');
  eliminar.textContent = 'Eliminar mapa';
  eliminar.id = 'eliminarLi';

  menu.appendChild(detalle);
  menu.appendChild(eliminar);
  menuContainer.appendChild(menu);

  mapHeader.appendChild(title);
  mapHeader.appendChild(icoMap);

  const divIconosDebajo = document.createElement('div');
  divIconosDebajo.id = 'divIconosDebajo';

  const icoMiembros = document.createElement('i');
  icoMiembros.id = 'icoMiembros';
  icoMiembros.className = 'fa-regular fa-user';

  const icoStar = document.createElement('i');
  icoStar.id = 'icoStar';
  icoStar.className = 'fa-regular fa-star';

  divIconosDebajo.appendChild(icoMiembros);
  divIconosDebajo.appendChild(icoStar);

  card.appendChild(mapHeader);
  card.appendChild(menuContainer);
  card.appendChild(divIconosDebajo);

  card.addEventListener('click', () => {
    page(`/mindmap/${map.id}`); // Ajusta la ruta según tu enrutador
  });

  eliminar.addEventListener('click', async () => {
    const confirmado = await mostrarPopupConfirmacion();
    if (!confirmado) return;

    try {
      await deleteMindMap(map.id);
      card.remove(); // Eliminar la tarjeta del DOM
    } catch (error) {
      console.error("Error al eliminar el mapa mental:", error);
    }
  });

  // Toggle del menú
  menuContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  return card;
}

const coloresDisponibles = [
  'mindmap-color-1', 'mindmap-color-2', 'mindmap-color-3', 'mindmap-color-4',
  'mindmap-color-5', 'mindmap-color-6', 'mindmap-color-7', 'mindmap-color-8',
  'mindmap-color-9', 'mindmap-color-10', 'mindmap-color-11'
];

function obtenerClaseColorPersistente(id) {
  const clave = `mindmap-color-${id}`;
  let color = localStorage.getItem(clave);

  if (!color) {
    const indiceAleatorio = Math.floor(Math.random() * coloresDisponibles.length);
    color = coloresDisponibles[indiceAleatorio];
    localStorage.setItem(clave, color);
  }

  return color;
}
