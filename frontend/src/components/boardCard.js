import { mostrarPopupConfirmacion } from "./workspaceCard.js";
import { deleteBoards, putBoard, salirseDelKanban } from "../js/board.js";
import { getUsuariosDisponibles } from "../js/board.js";
import { createInvitation } from "../js/notifications.js";
import page from "page";
import { socket } from "../js/socket.js";
import { socketGetInvitations } from "../js/socketsEvents.js";
// kanbanBoard


export function BoardCard(board) {
  const card = document.createElement('div');
  card.className = 'board-card';
  card.setAttribute('tabindex', '0'); // Permite navegar con el teclado
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir tablero: ${board.nombre}`);
  card.style.backgroundColor = board.color;
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
  if (board.rol_tablero !== 'admin') {
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

  if (board.rol_tablero !== 'admin') {
    icoMiembros.className = 'fa-regular fa-user';
    icoMiembros.title = 'Eres miembro';

  } else {
    icoMiembros.className = 'fa-solid fa-user-tie';
    icoMiembros.title = 'Eres administrador';

  }

  const icoStar = document.createElement('i');
  icoStar.id = 'icoStar';
  icoStar.className = 'fa-regular fa-star';

  divIconosDebajo.appendChild(icoMiembros);
  divIconosDebajo.appendChild(icoStar);

  card.appendChild(boardHeader);
  card.appendChild(divIconosDebajo);

  card.addEventListener('click', () => {
    page(`/board/${board.id}`); // Redirige a la página del workspace con el ID del workspace
    //sessionStorage.setItem('idWorkspace', board.espacio_trabajo_id)
  });


  eliminar.addEventListener('click', async () => {
    const confirmado = await mostrarPopupConfirmacion();
    if (!confirmado) return;

    //const usuarioId = localStorage.getItem('usuario_id');

    try {
      await deleteBoards(board.id);
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
  salir.addEventListener('click', async (e) => {
    await salirseDelKanban(board.id);
    card.remove();

  });

  detalle.addEventListener('click', async (e) => {
    popupEditarBoard(board);

  });

  board.__domRef = {
    nameElement: title,
    cardElement: card
  };



  return card;
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

  // Contenedor para el input, selector y sugerencias en fila
  const inputRoleContainer = document.createElement('div');
  inputRoleContainer.className = 'invite-input-role-container';

  // Contenedor para el selector de rol
  const roleContainer = document.createElement('div');
  roleContainer.className = 'invite-role-container';

  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'select-wrapper';
  // Crear el icono de Font Awesome
  const icon = document.createElement('i');
  icon.className = 'fa fa-chevron-down'; // Añadir la clase de Font Awesome

  const selectBox = document.createElement('div');
  selectBox.className = 'select-box';
  selectBox.textContent = 'Miembro'; // Rol por defecto


  selectBox.appendChild(icon);

  const roleOptions = document.createElement('div');
  roleOptions.className = 'role-options';

  const memberOption = document.createElement('div');
  memberOption.className = 'role-option';
  memberOption.textContent = 'Miembro';

  const adminOption = document.createElement('div');
  adminOption.className = 'role-option';
  adminOption.textContent = 'Administrador';

  roleOptions.appendChild(memberOption);
  roleOptions.appendChild(adminOption);

  selectBox.addEventListener('click', () => {
    roleOptions.classList.toggle('open');
  });

  memberOption.addEventListener('click', () => {
    selectBox.textContent = 'miembro';
    roleOptions.classList.remove('open');
  });

  adminOption.addEventListener('click', () => {
    selectBox.textContent = 'admin';
    roleOptions.classList.remove('open');
  });

  selectWrapper.appendChild(selectBox);
  selectWrapper.appendChild(roleOptions);

  roleContainer.appendChild(selectWrapper);

  // Añadimos el input y el contenedor del rol al contenedor de fila
  inputRoleContainer.appendChild(input);
  inputRoleContainer.appendChild(roleContainer);

  const buttons = document.createElement('div');
  buttons.className = 'invite-buttons';

  const enviarBtn = document.createElement('button');
  enviarBtn.textContent = 'Enviar invitación';
  enviarBtn.className = 'invite-send';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.className = 'invite-cancel';

  /*input.addEventListener('input', async () => {
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
  });*/

  input.addEventListener('input', async () => {
    const value = input.value.trim().toLowerCase();
    suggestionBox.textContent = '';

    if (value.length > 0) {
      const users = await getUsuariosDisponibles(board.id, value);

      users.forEach(user => {
        const isAlreadyMember = board.miembros.some(miembro => miembro.email === user.email); // compara por email

        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        if (isAlreadyMember) {
          suggestion.classList.add('disabled'); // puedes usar esta clase para estilos grises
        }

        const avatar = document.createElement('img');
        avatar.src = user.avatar_url;
        avatar.alt = 'Avatar';
        avatar.className = 'suggestion-avatar';

        const emailText = document.createElement('span');
        emailText.textContent = isAlreadyMember
          ? `${user.email} (ya está en el tablero)`
          : user.email;

        suggestion.append(avatar, emailText);

        if (!isAlreadyMember) {
          suggestion.addEventListener('click', () => {
            input.value = user.email;
            suggestionBox.textContent = '';
          });
        }

        suggestionBox.appendChild(suggestion);
      });
    }
  });

  enviarBtn.addEventListener('click', async () => {
    const email = input.value.trim();
    const selectedRole = selectBox.textContent.trim(); // el rol seleccionado (admin, miembro)
    if (email) {
      console.log('Invitación enviada a:', email);
      await createInvitation(email, board.espacio_trabajo_id, "kanban", board.id, selectedRole);
      console.log("socket conectado:", socket);

      socketGetInvitations();

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
  container.append(title, inputRoleContainer, suggestionBox, buttons);
  popup.appendChild(container);
  document.body.appendChild(popup);
}


export function popupEditarBoard(board) {
  // Eliminar cualquier popup anterior
  const existingPopup = document.getElementById('popupEditarBoard');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'popupEditarBoard';
  popup.className = 'popup-editar-tarea';

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const content = document.createElement('div');
  content.className = 'taskEdit-content';

  // Contenedor del título
  const tituloContainer = document.createElement('div');
  tituloContainer.id = 'tituloContainer';

  const titulo = document.createElement('h3');
  titulo.textContent = board.nombre;
  titulo.style.margin = 0;

  const inputTitulo = document.createElement('input');
  inputTitulo.type = 'text';
  inputTitulo.style.display = 'none';
  inputTitulo.value = board.nombre;
  inputTitulo.className = 'input-editar-titulo';

  const iconoLapiz = document.createElement('i');
  iconoLapiz.className = 'fa-solid fa-pen';
  iconoLapiz.style.cursor = 'pointer';

  iconoLapiz.addEventListener('click', () => {
    titulo.style.display = 'none';
    iconoLapiz.style.display = 'none';
    inputTitulo.style.display = 'inline-block';
    inputTitulo.focus();
  });

  inputTitulo.addEventListener('blur', () => finalizarEdicion());
  inputTitulo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finalizarEdicion();
    }
  });
  async function finalizarEdicion() {
    const nuevoTitulo = inputTitulo.value.trim();
    if (nuevoTitulo && nuevoTitulo !== board.nombre) {
      board.nombre = nuevoTitulo;
      titulo.textContent = nuevoTitulo;
      await putBoard(board.id, board.nombre);

      if (board.__domRef && board.__domRef.nameElement) {
        board.__domRef.nameElement.textContent = nuevoTitulo;

      }

    }

    titulo.style.display = 'block';
    iconoLapiz.style.display = 'inline-block';
    inputTitulo.style.display = 'none';
  }

  const divTop = document.createElement('div');
  divTop.id = 'divTop';

  const borrarButton = document.createElement('div');
  borrarButton.id = 'borrarButton';
  borrarButton.title = 'Haz clic para eliminar el espacio de trabajo';

  const spanBorrar = document.createElement('span');
  spanBorrar.id = 'spanBorrar';
  spanBorrar.className = 'fa-solid fa-trash';

  borrarButton.appendChild(spanBorrar);

  tituloContainer.append(titulo, inputTitulo, iconoLapiz);

  if (board.rol_tablero === 'admin') {
    divTop.append(tituloContainer, borrarButton);

  } else {
    divTop.append(tituloContainer);

  }

  divTop.append(tituloContainer, borrarButton);

  const hr = document.createElement('hr');
  hr.id = 'hrEditarTarea';


  const rolWorkspace = document.createElement('span');
  rolWorkspace.id = 'rolWorkspace';
  // Limpia el contenido previo
  rolWorkspace.textContent = 'En este espacio de trabajo eres ';

  // Crea un span para la parte en negrita
  const estadoSpan = document.createElement('span');
  const rol = board.rol_tablero === 'admin' ? 'Administrador' : 'Miembro';
  estadoSpan.textContent = rol;
  estadoSpan.style.fontWeight = 'bolder';

  // Añade el span al nodo principal
  rolWorkspace.appendChild(estadoSpan);

  // Descripción
  const divDescrip = document.createElement('div');
  divDescrip.id = 'divDescrip';

  const icoDescrip = document.createElement('i');
  icoDescrip.className = 'fa-regular fa-file-alt';
  icoDescrip.id = 'icoDescrip';

  const inputLabelDescrip = document.createElement('label');
  inputLabelDescrip.id = 'inputLabel';
  inputLabelDescrip.textContent = 'Descripción';

  divDescrip.append(icoDescrip, inputLabelDescrip);

  const inputDescrip = document.createElement('textarea');
  inputDescrip.value = board.descripcion || '';
  inputDescrip.placeholder = 'Descripción del espacio de trabajo';


  // Actividad
  const divActividad = document.createElement('div');
  divActividad.id = 'divDescrip';

  const icoActividad = document.createElement('i');
  icoActividad.className = 'fa-regular fa-clock';
  icoActividad.id = 'icoDescrip';

  const inputLabelActividad = document.createElement('label');
  inputLabelActividad.id = 'inputLabel';
  inputLabelActividad.textContent = 'Actividad reciente: ';

  // Crea un span para la parte en negrita
  const actividadSpan = document.createElement('span');
  actividadSpan.textContent = board.ultima_actividad;
  actividadSpan.id = 'inputLabelActividad';

  // Añade el span al label
  inputLabelActividad.appendChild(actividadSpan);

  // Añade los iconos y label al div
  divActividad.append(icoActividad, inputLabelActividad);

  // Fecha creación
  const divCreacion = document.createElement('div');
  divCreacion.id = 'divDescrip';

  const icoCreacion = document.createElement('i');
  icoCreacion.className = 'fa-regular fa-calendar';
  icoCreacion.id = 'icoDescrip';

  const inputLabelCreacion = document.createElement('label');
  inputLabelCreacion.id = 'inputLabel';
  inputLabelCreacion.textContent = 'Creación del tablero: ';

  // Crea un span para la parte en negrita
  const creacionSpan = document.createElement('span');
  creacionSpan.textContent = board.fecha_creacion_relativa;
  creacionSpan.id = 'inputLabelActividad';

  // Añade el span al label
  inputLabelCreacion.appendChild(creacionSpan);

  // Añade los iconos y label al div
  divCreacion.append(icoCreacion, inputLabelCreacion);

  // Acciones
  const acciones = document.createElement('div');
  acciones.className = 'taskEdit-actions';

  const guardar = document.createElement('button');
  guardar.textContent = 'Guardar';
  guardar.className = 'taskEdit-confirmar';

  guardar.addEventListener('click', async () => {
    board.descripcion = inputDescrip.value.trim();
    await putBoard(board.id, board.nombre, board.descripcion);
    //fetchAndRenderWorkspaces(); // si lo tienes definido
    popup.remove();
  });

  const cancelar = document.createElement('button');
  cancelar.textContent = 'Cancelar';
  cancelar.className = 'taskEdit-cancelar';

  cancelar.addEventListener('click', () => popup.remove());

  borrarButton.addEventListener('click', async () => {
    await deleteBoards(board.id);
    //fetchAndRenderWorkspaces(); // si lo tienes definido
    popup.remove();
  });

  acciones.append(cancelar, guardar);
  content.append(divTop, rolWorkspace, hr, divDescrip, inputDescrip, divActividad, divCreacion, acciones);
  popup.append(overlay, content);
  document.body.appendChild(popup);

  overlay.addEventListener('click', () => popup.remove());
}
