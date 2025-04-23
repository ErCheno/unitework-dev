// kanbanBoard.js
import Sortable from "sortablejs";

export function BoardCard(board) {
  const card = document.createElement('div');
  card.className = 'board-card';
  card.setAttribute('tabindex', '0'); // Permite navegar con el teclado
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir tablero: ${board.nombre}`);
  card.classList.add(obtenerClaseColorAleatorio()); // Solo añadir el color aleatorio

  const title = document.createElement('h3');
  title.className = 'board-title';
  title.textContent = board.nombre || 'Tablero sin nombre';

  const description = document.createElement('p');
  description.className = 'board-description';
  description.textContent = board.descripcion?.trim() || 'Sin descripción';

  card.appendChild(title);
  card.appendChild(description);

  const redirectToBoard = () => {
    window.location.href = `/kanban/${board.id}`;
  };

  card.addEventListener('click', redirectToBoard);
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      redirectToBoard();
    }
  });

  return card;
}

// Inicialización de SortableJS (en tu vista principal, no dentro de BoardCard)
export function initBoardSortable(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  new Sortable(container, {
    animation: 150,
    direction: "horizontal",
    ghostClass: "opacity-50",
    dragClass: "dragging",
    scroll: true,
    scrollSensitivity: 60,
    scrollSpeed: 15,
  });
}

const coloresDisponibles = [
    'kanban-color-1', 'kanban-color-2', 'kanban-color-3', 'kanban-color-4', 
    'kanban-color-5', 'kanban-color-6', 'kanban-color-7', 'kanban-color-8', 
    'kanban-color-9', 'kanban-color-10', 'kanban-color-11'
];

// Función para obtener un color aleatorio de la lista
function obtenerClaseColorAleatorio() {
  const indiceAleatorio = Math.floor(Math.random() * coloresDisponibles.length);
  return coloresDisponibles[indiceAleatorio];
}
