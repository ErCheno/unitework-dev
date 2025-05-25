import { deleteMindMap, getUsuariosDisponiblesInvitacionMapa } from "../js/mindMap";
import { createInvitation } from "../js/notifications";
import { socketGetInvitations } from "../js/socketsEvents";
import { mostrarPopupConfirmacion } from "./workspaceCard";
import page from "page";
import { socket } from "../js/socket";

export function MindMapCard(map) {
  const card = document.createElement('div');
  card.className = 'mindmap-card'; // Puedes cambiar a 'mindmap-card' si quieres un estilo diferente
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Abrir mapa mental: ${map.titulo}`);
  const originalColor = map.color; // Ej. '#3498db'
  const lightColor = lightenColor(originalColor, 40); // Aclarar un 10%
  card.style.backgroundColor = lightColor;

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

  const invitar = document.createElement('li');
  invitar.textContent = 'Invitar usuarios';

  const salir = document.createElement('li');
  salir.textContent = 'Salir del espacio';

  menu.appendChild(detalle);
  if (map.rol_mapa !== 'admin') {
    menu.appendChild(salir);
  } else {
    menu.appendChild(invitar);
    menu.appendChild(eliminar);
  }

  menuContainer.appendChild(menu);

  mapHeader.appendChild(title);
  menuContainer.appendChild(icoMap);
  mapHeader.appendChild(menuContainer);

  const divIconosDebajo = document.createElement('div');
  divIconosDebajo.id = 'divIconosDebajo';

  const icoMiembros = document.createElement('i');
  icoMiembros.id = 'icoMiembros';
  if (map.rol_mapa !== 'admin') {
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
  card.appendChild(mapHeader);
  card.appendChild(divIconosDebajo);

  card.addEventListener('click', () => {
    localStorage.setItem('ultimo_map_id', map.id);

    // Opcional: guardar también el nombre del tablero o el workspace
    localStorage.setItem('ultimo_map_nombre', map.titulo);
    localStorage.setItem('ultimo_workspace_id', map.espacio_trabajo_id);

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

  invitar.addEventListener('click', (e) => {
    mostrarPopupInvitacion(map);
  });

  salir.addEventListener('click', async (e) => {
    await salirseDelKanban(board.id);
    card.remove();

  });

  return card;
}


export function mostrarPopupInvitacion(map) {
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



  input.addEventListener('input', async () => {
    const value = input.value.trim().toLowerCase();
    suggestionBox.textContent = '';

    if (value.length > 0) {
      const users = await getUsuariosDisponiblesInvitacionMapa(map.id, value);

      users.forEach(user => {
        const isAlreadyMember = map.miembros.some(miembro => miembro.email === user.email); // compara por email

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
    const selectedRole = selectBox.textContent; // Obtener el rol seleccionado
    if (email) {
      console.log('Invitación enviada a:', email);
      console.log(map);
      await createInvitation(email, map.espacio_trabajo_id, "mapa_mental", map.id, selectedRole);
      console.log("socket conectado:", socket); // Prueba en el archivo donde lo usas

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

function lightenColor(hex, percent) {
  // Elimina el "#" si está presente
  hex = hex.replace(/^#/, '');

  // Convierte a enteros R, G, B
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Calcula el nuevo valor aclarado
  r = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
  g = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
  b = Math.min(255, Math.floor(b + (255 - b) * percent / 100));

  // Devuelve en formato hex
  const toHex = c => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
