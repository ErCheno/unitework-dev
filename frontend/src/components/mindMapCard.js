import { deleteMindMap, getUsuariosDisponiblesInvitacionMapa, modificarMindMap, salirseDelMindMap } from "../js/mindMap";
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
    mostrarPopupInvitacionMindmap(map);
  });

  salir.addEventListener('click', async (e) => {
    await salirseDelMindMap(map.id);
    card.remove();

  });

  detalle.addEventListener('click', async (e) => {
    popupEditarMindMap(map)

  });

  map.__domRef = {
    nameElement: title,
    cardElement: card
  };

  return card;
}


export function mostrarPopupInvitacionMindmap(map) {
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

export function lightenColor(hex, percent) {
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

export function popupEditarMindMap(mindmap) {
  // Eliminar cualquier popup anterior
  const existingPopup = document.getElementById('popupEditarMindMap');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'popupEditarMindMap';
  popup.className = 'popup-editar-tarea';

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const content = document.createElement('div');
  content.className = 'taskEdit-content';

  // Contenedor del título
  const tituloContainer = document.createElement('div');
  tituloContainer.id = 'tituloContainer';

  const titulo = document.createElement('h3');
  titulo.textContent = mindmap.titulo;
  titulo.style.margin = 0;

  const inputTitulo = document.createElement('input');
  inputTitulo.type = 'text';
  inputTitulo.style.display = 'none';
  inputTitulo.value = mindmap.titulo;
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
    if (nuevoTitulo && nuevoTitulo !== mindmap.titulo) {
      mindmap.titulo = nuevoTitulo;
      titulo.textContent = nuevoTitulo;
      await modificarMindMap(mindmap.id, mindmap.titulo);

      if (mindmap.__domRef && mindmap.__domRef.nameElement) {
        mindmap.__domRef.nameElement.textContent = nuevoTitulo;

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

  if (mindmap.rol_mapa === 'admin') {
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
  console.log(mindmap);
  const rol = mindmap.rol_mapa === 'admin' ? 'Administrador' : 'Miembro';
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
  inputDescrip.value = mindmap.descripcion || '';
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
  actividadSpan.textContent = mindmap.ultima_actividad;
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
  creacionSpan.textContent = mindmap.fecha_creacion_relativa;
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
    mindmap.descripcion = inputDescrip.value.trim();
    await modificarMindMap(mindmap.id, mindmap.titulo, mindmap.descripcion);
    popup.remove();
  });

  const cancelar = document.createElement('button');
  cancelar.textContent = 'Cancelar';
  cancelar.className = 'taskEdit-cancelar';

  cancelar.addEventListener('click', () => popup.remove());

  borrarButton.addEventListener('click', async () => {
    await deleteMindMap(mindmap.id);
    popup.remove();
  });

  acciones.append(cancelar, guardar);
  content.append(divTop, rolWorkspace, hr, divDescrip, inputDescrip, divActividad, divCreacion, acciones);
  popup.append(overlay, content);
  document.body.appendChild(popup);

  overlay.addEventListener('click', () => popup.remove());
}
