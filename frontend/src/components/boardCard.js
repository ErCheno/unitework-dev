import { mostrarPopupConfirmacion } from "./workspaceCard";
import { deleteBoards } from "../../public/js/board";
import { getUsuariosDisponibles } from "../../public/js/board";
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

  invitar.addEventListener('click', (e) => {
    mostrarPopupInvitacion(board);
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



export function mostrarPopupInvitacion(board) {
  const existingPopup = document.querySelector('.invite-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.className = 'invite-popup';

  const container = document.createElement('div');
  container.className = 'invite-popup-container';

  const title = document.createElement('h2');
  title.textContent = 'Invitar usuario';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Introduce el correo electrónico';
  input.className = 'invite-input';

  const suggestionBox = document.createElement('div');
  suggestionBox.className = 'invite-suggestions';

  const buttons = document.createElement('div');
  buttons.className = 'invite-buttons';

  const enviarBtn = document.createElement('button');
  enviarBtn.textContent = 'Enviar invitación';
  enviarBtn.className = 'invite-send';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.className = 'invite-cancel';

  // Simulamos usuarios disponibles
 /* const users = [
    { email: 'emilia@example.com', avatar: 'https://i.pravatar.cc/40?u=emilia' },
    { email: 'emilio123@example.com', avatar: 'https://i.pravatar.cc/40?u=emilio' },
    { email: 'pablo@example.com', avatar: 'https://i.pravatar.cc/40?u=pablo' },
    { email: 'emma@example.com', avatar: 'https://i.pravatar.cc/40?u=emma' },
  ];*/

  input.addEventListener('input', async () => {
    const value = input.value.trim().toLowerCase();
    suggestionBox.textContent = '';
  
    if (value.length > 0) {
      const users = await getUsuariosDisponibles(board.id, value); // <-- Aquí usas la función real
  
      users.forEach(user => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
  
        const avatar = document.createElement('img');
        avatar.src = user.avatar_url; // <-- usa el campo del backend
        avatar.alt = 'Avatar';
        avatar.className = 'suggestion-avatar';
  
        const emailText = document.createElement('span');
        emailText.textContent = user.email;
  
        suggestion.append(avatar, emailText);
        suggestion.addEventListener('click', () => {
          input.value = user.email;
          suggestionBox.textContent = '';
        });
  
        suggestionBox.appendChild(suggestion);
      });
    }
  });

  enviarBtn.addEventListener('click', () => {
    const email = input.value.trim();
    if (email) {
      console.log('Invitación enviada a:', email);
      popup.remove();
    } else {
      input.classList.add('error');
      input.placeholder = 'Por favor introduce un correo válido';
    }
  });

  cancelBtn.addEventListener('click', () => {
    popup.remove();
  });

  buttons.append(enviarBtn, cancelBtn);
  container.append(title, input, suggestionBox, buttons);
  popup.appendChild(container);
  document.body.appendChild(popup);
}

/*function crearAvatarDefecto(usuario) {
  const container = document.createElement('div');
  container.classList.add('avatar-container');

  if (usuario.avatar) {
    const img = document.createElement('img');
    img.src = `/uploads/usuarios/${usuario.avatar}`;
    img.alt = 'Avatar';
    img.className = 'avatar-img';
    container.appendChild(img);
  } else {
    const inicial = usuario.nombre.charAt(0).toUpperCase();
    const fallback = document.createElement('div');
    fallback.className = 'avatar-placeholder';
    fallback.textContent = inicial;
    container.appendChild(fallback);
  }

  return container;
}*/
