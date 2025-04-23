// kanbanBoard.js
import Sortable from "sortablejs";

export function BoardCard(board) {
  const card = document.createElement('div');
  card.className = 'board-card';

  const title = document.createElement('h3');
  title.className = 'board-title';
  title.textContent = board.nombre;

  const description = document.createElement('p');
  description.className = 'board-description';
  description.textContent = board.descripcion || 'Sin descripción';

  card.appendChild(title);
  card.appendChild(description);

  // Puedes añadir click para redirigir al tablero específico
  card.addEventListener('click', () => {
      // Redirige a la vista de tablero específico
      window.location.href = `/kanban/${board.id}`;
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
