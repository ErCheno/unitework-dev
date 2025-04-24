import { mostrarPopupConfirmacion } from "./workspaceCard";
import { deleteBoards } from "../../public/js/board";

// kanbanBoard.js
export function BoardCard(board) {
  const card = document.createElement('div');
  card.className = 'board-card';
  card.setAttribute('tabindex', '0'); // Permite navegar con el teclado
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir tablero: ${board.nombre}`);
  card.classList.add(obtenerClaseColorPersistente(board.id));


  const boardHeader = document.createElement('div');
  boardHeader.className = 'board-header';

  const title = document.createElement('h3');
  title.className = 'board-title';
  title.textContent = board.nombre || 'Tablero sin nombre';

  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';

  const icoBoard = document.createElement('i');
  icoBoard.className = 'fa-solid fa-ellipsis';
  icoBoard.id = 'icoBoard';

  const menu = document.createElement('ul');
  menu.className = 'board-menu hidden';

  const detalle = document.createElement('li');
  detalle.textContent = 'Ver detalles';

  const invitar = document.createElement('li');
  invitar.textContent = 'Invitar usuarios';

  const salir = document.createElement('li');
  salir.textContent = 'Salir del espacio';

  const eliminar = document.createElement('li');
  eliminar.textContent = 'Eliminar espacio';
  eliminar.id = 'eliminarLi';

  menu.appendChild(detalle);
  if (board.rol !== 'admin') {
    menu.appendChild(salir);
  } else {
    menu.appendChild(invitar);
    menu.appendChild(eliminar);
  }

  menuContainer.appendChild(menu);

  menuContainer.appendChild(icoBoard);

  boardHeader.appendChild(title);
  boardHeader.appendChild(menuContainer);

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

  card.appendChild(boardHeader);
  card.appendChild(divIconosDebajo);
  
  eliminar.addEventListener('click', async () => {
    const confirmado = await mostrarPopupConfirmacion();
    if (!confirmado) return;
  
    const usuarioId = localStorage.getItem('usuario_id');
    
    try {
      await deleteBoards(usuarioId, board.id);
      card.remove(); // Eliminar la tarjeta del DOM directamente
    } catch (error) {
      console.error("Error al eliminar el tablero:", error);
    }
  });
  


  /*
  const redirectToBoard = () => {
    window.location.href = `/kanban/${board.id}`;
  };

  card.addEventListener('click', redirectToBoard);
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      redirectToBoard();
    }
  });*/

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
  'kanban-color-1', 'kanban-color-2', 'kanban-color-3', 'kanban-color-4',
  'kanban-color-5', 'kanban-color-6', 'kanban-color-7', 'kanban-color-8',
  'kanban-color-9', 'kanban-color-10', 'kanban-color-11'
];

// Función para obtener un color aleatorio de la lista
function obtenerClaseColorPersistente(boardId) {
  const clave = `kanban-color-${boardId}`;
  let color = localStorage.getItem(clave);

  if (!color) {
    const indiceAleatorio = Math.floor(Math.random() * coloresDisponibles.length);
    color = coloresDisponibles[indiceAleatorio];
    localStorage.setItem(clave, color);
  }

  return color;
}



