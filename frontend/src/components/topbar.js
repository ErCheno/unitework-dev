import page from 'page';
import { logoutUser } from '../js/auth.js';
import { showToast } from "../../public/js/validator/regex.js";
import { acceptInvitation, denyInvitation, getInvitations } from '../js/notifications.js';
import { getUsuariosDisponibles } from '../js/board.js';
import { connectSocket, socket } from '../js/socket.js';
import { socketGetInvitations, socketGetWorkspaces } from '../js/socketsEvents.js';
import { renderWorkspaces } from '../pages/myworkspacesPage.js';
import { fetchWorkspaces } from '../js/workspaces.js';
let userIcon;

export function TopNavbar() {
  const container = document.createElement('div');
  container.className = 'top-navbar-container';

  const nav = document.createElement('nav');
  nav.className = 'top-navbar';
  nav.id = 'top-navbar';

  // Contenedor del logo o nombre de la app
  const contenedorLogo = document.createElement('div');
  contenedorLogo.className = 'logo';

  const logoImg = document.createElement('img');
  logoImg.src = '../img/poff.png';
  logoImg.alt = 'Logo de Unite Work';

  const tituloH1 = document.createElement('h1');
  tituloH1.textContent = 'UniteWork';

  contenedorLogo.appendChild(logoImg);
  contenedorLogo.appendChild(tituloH1);

  // Menú principal
  const menu = document.createElement('ul');
  menu.className = 'menu';

  // Ícono de usuario y contenedor desplegable
  const userLi = document.createElement('li');
  userLi.id = 'user';
  userLi.className = 'user-menu';

  const userA = document.createElement('a');
  userA.href = '#';

  // Crea un contenedor para el avatar
  const userAvatarContainer = document.createElement('div');
  userAvatarContainer.className = 'user-avatar-container';

  // Verifica si hay un avatar guardado en el localStorage, si no, usa el icono por defecto
  const avatarUrl = localStorage.getItem('avatar_url');

  if (avatarUrl) {
    // Si el usuario tiene un avatar personalizado, se mostrará la imagen
    userIcon = document.createElement('img');
    userIcon.src = 'http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/' + avatarUrl;  // Usa la URL del avatar
    userIcon.alt = 'Avatar de usuario';
    userAvatarContainer.id = 'user-avatar';  // Asigna un ID único para el avatar

  } else {
    // Si no tiene un avatar, se mostrará el icono de usuario por defecto
    userIcon = document.createElement('img');
    userIcon.className = 'fa-regular fa-user';  // Icono de usuario por defecto
    userIcon.src = 'http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/default-avatar.png';  // Usa la URL del avatar
    userIcon.alt = 'Avatar de usuario';
    userAvatarContainer.id = 'default-avatar';  // Asigna un ID único para el icono por defecto

  }

  userAvatarContainer.appendChild(userIcon);
  userA.appendChild(userAvatarContainer);
  userLi.appendChild(userA);

  // Menú desplegable (oculto por defecto)
  const dropdown = document.createElement('ul');
  dropdown.className = 'dropdown-menu';

  const editarPerfil = document.createElement('li');
  const editarA = document.createElement('a');
  editarA.href = '#';
  editarA.textContent = 'Editar perfil';
  editarA.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarEditPerfil();  // Llama al popup para editar perfil
  });
  editarPerfil.appendChild(editarA);


  const hrDropdown = document.createElement('hr');
  hrDropdown.id = 'hrDropdown';

  const cerrarSesion = document.createElement('li');
  const cerrarA = document.createElement('a');
  cerrarA.href = '#';
  cerrarA.textContent = 'Cerrar sesión';
  cerrarA.addEventListener('click', () => logoutUser());

  cerrarSesion.appendChild(cerrarA);

  dropdown.appendChild(editarPerfil);
  dropdown.appendChild(hrDropdown);
  dropdown.appendChild(cerrarSesion);
  userLi.appendChild(dropdown);
  userLi.title = 'Perfil de usuario';

  // Mostrar/ocultar el dropdown al hacer click en el icono de usuario
  userA.addEventListener('click', (e) => {
    e.preventDefault();
    const isVisible = dropdown.classList.contains('show');
    dropdown.classList.toggle('show', !isVisible);
  });

  // Cerrar el menú si se hace clic fuera
  document.addEventListener('click', (e) => {
    if (!userLi.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });

  // Ícono de notificación
  const notifLi = document.createElement('li');
  notifLi.id = 'notif';
  notifLi.title = 'Notificaciones';

  const notifA = document.createElement('a');
  notifA.href = '#';
  const notifIcon = document.createElement('i');
  notifIcon.className = 'fa-regular fa-bell';

  const notifBadge = document.createElement('span');
  notifBadge.className = 'notif-badge';
  notifBadge.classList.add('hidden');
  notifBadge.textContent = '0';

  notifA.appendChild(notifIcon);
  notifA.appendChild(notifBadge);
  notifLi.appendChild(notifA);

  // Crear la bandeja de notificaciones
  const notifDropdown = document.createElement('div');
  notifDropdown.id = 'notif-dropdown';
  notifDropdown.className = 'notif-dropdown hidden';

  // Header
  const notifHeader = document.createElement('div');
  notifHeader.className = 'notif-header';
  notifHeader.textContent = 'Notificaciones';
  notifDropdown.appendChild(notifHeader);

  // Lista de notificaciones
  const notifList = document.createElement('ul');
  notifList.className = 'notif-list';

  cargarInvitaciones(notifList, notifBadge);


  //startPollingNotificaciones(); // Polling cada 5s


  // Función para crear una notificación

  notifDropdown.appendChild(notifList);

  // Footer
  const notifFooter = document.createElement('div');
  notifFooter.className = 'notif-footer';
  const notifLink = document.createElement('a');
  notifLink.href = '#';
  notifLink.textContent = 'Ver todas';
  notifFooter.appendChild(notifLink);
  notifDropdown.appendChild(notifFooter);


  // Insertar dropdown en el ítem de notificación
  notifLi.appendChild(notifDropdown);

  // Mostrar/ocultar al hacer clic
  notifLi.addEventListener('click', (e) => {
    e.preventDefault();
    notifDropdown.classList.toggle('hidden');
  });

  // Cerrar si se hace clic fuera del componente
  document.addEventListener('click', (e) => {
    if (!notifLi.contains(e.target)) {
      notifDropdown.classList.add('hidden');
    }
  });

  // Otras secciones del menú
  const dasboardLi = document.createElement('li');
  const dashboardA = document.createElement('a');
  dashboardA.href = '/dashboard';
  dashboardA.textContent = 'Inicio';
  dasboardLi.appendChild(dashboardA);

  const ultimoBoardId = localStorage.getItem('ultimo_board_id');


  const kanbanLi = document.createElement('li');
  const kanbanA = document.createElement('a');

  kanbanA.href = '/lastboard';

  kanbanA.textContent = 'Tablero Kanban';
  kanbanLi.appendChild(kanbanA);

  const gruposLi = document.createElement('li');
  const gruposA = document.createElement('a');
  gruposA.href = '#';
  gruposA.textContent = 'Mis espacios de trabajo';

  const workspaceDropdown = document.createElement('div');
  workspaceDropdown.className = 'submenu-dropdown hidden';



  gruposA.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Click detectado en Mis espacios de trabajo');

    try {
      const workspaces = await fetchWorkspaces();
      console.log(workspaces);

      workspaceDropdown.innerHTML = ''; // limpiar cualquier contenido previo

      if (workspaces.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No tienes espacios de trabajo.';
        emptyMsg.classList.add('empty-msg');
        workspaceDropdown.appendChild(emptyMsg);
      } else {
        workspaces.forEach(ws => {
          const wsLink = document.createElement('a');
          wsLink.className = 'wsLink';
          wsLink.href = `/workspace/${ws.id}`;
          wsLink.textContent = ws.nombre;
          workspaceDropdown.appendChild(wsLink);
        });
      }

    } catch (error) {
      workspaceDropdown.innerHTML = ''; // Limpia por si hay contenido antes
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error al cargar los espacios.';
      console.error(error);
      errorMsg.classList.add('error-msg');
      workspaceDropdown.appendChild(errorMsg);
    }
  });

  gruposA.addEventListener('dblclick', (e) => {
    e.preventDefault(); // Opcional, para prevenir comportamiento por defecto
    page('/myworkspaces'); // redirige a la página deseada
  });

  gruposA.addEventListener('click', (e) => {
    e.preventDefault();
    workspaceDropdown.classList.toggle('hidden');
  });
  // Cerrar menú si se hace clic fuera
  document.addEventListener('click', (e) => {
    if (!gruposLi.contains(e.target)) {
      workspaceDropdown.classList.add('hidden');
    }
  });

  gruposLi.appendChild(gruposA);
  gruposLi.appendChild(workspaceDropdown);


  const mapasmentalesLi = document.createElement('li');
  const mapasmentalesA = document.createElement('a');
  mapasmentalesA.href = '/lastmindmap';

  mapasmentalesA.textContent = 'Mapa mental';
  mapasmentalesLi.appendChild(mapasmentalesA);

  // Añadir al menú principal
  menu.appendChild(dasboardLi);
  menu.appendChild(gruposLi);

  menu.appendChild(kanbanLi);
  menu.appendChild(mapasmentalesLi);
  menu.appendChild(notifLi);
  menu.appendChild(userLi);

  nav.appendChild(contenedorLogo);
  nav.appendChild(menu);
  container.appendChild(nav);



  return container;
}

export function mostrarEditPerfil() {
  //avatarImg.src = localStorage.getItem('avatar_url'); // Ya guarda la URL completa


  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'popup-edit-perfil';

  // Header
  const popupHeader = document.createElement('div');
  popupHeader.className = 'popup-header';

  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  const avatarImg = document.createElement('img');
  avatarImg.src = 'http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/' + localStorage.getItem('avatar_url');
  avatarImg.alt = 'Avatar';

  const editIcon = document.createElement('i');
  editIcon.id = 'edit-icon';
  editIcon.className = 'fa-solid fa-pencil';

  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.accept = 'image/*';
  inputFile.style.display = 'none';
  document.body.appendChild(inputFile); // Añádelo al DOM para poder usarlo


  [avatarImg, editIcon].forEach(element => {
    element.addEventListener('click', () => {
      inputFile.click();
    });
  });

  inputFile.addEventListener('change', () => {
    const file = inputFile.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = function () {
      if (img.width < 100 || img.height < 100) {
        showToast('La imagen debe tener al menos 100x100 píxeles.', 'error');
        inputFile.value = '';
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          avatarImg.src = e.target.result;
          //localStorage.setItem('avatar_url', e.target.result);

        };
        reader.readAsDataURL(file);

      }
    };

    // Esta línea era la que te faltaba:
    img.src = URL.createObjectURL(file);
  });




  avatarContainer.appendChild(avatarImg);
  avatarContainer.appendChild(editIcon);

  const headerInfo = document.createElement('div');
  headerInfo.className = 'header-info';
  const headerName = document.createElement('h1');
  headerName.textContent = localStorage.getItem('username') || 'Nombre de Usuario';
  const headerEmail = document.createElement('p');
  headerEmail.textContent = localStorage.getItem('email') || 'user@example.com';
  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.placeholder = 'Nuevo nombre';

  headerInfo.appendChild(headerName);
  headerInfo.appendChild(headerEmail);
  headerInfo.appendChild(inputName);

  popupHeader.appendChild(avatarContainer);
  popupHeader.appendChild(headerInfo);

  // Body vacío por ahora
  const popupBody = document.createElement('div');
  popupBody.className = 'popup-body';

  // Footer
  const popupFooter = document.createElement('div');
  popupFooter.className = 'popup-footer';

  const cancelButton = document.createElement('button');
  cancelButton.className = 'cancel';
  cancelButton.textContent = 'Cancelar';
  cancelButton.addEventListener('click', () => closePopup(overlay, popup));

  const saveButton = document.createElement('button');
  saveButton.className = 'save';
  saveButton.textContent = 'Guardar';
  saveButton.addEventListener('click', async () => {
    const file = inputFile.files[0];
    if (!file) return alert('Selecciona una imagen');

    const formData = new FormData();
    formData.append('avatar', file);
    const userId = localStorage.getItem('usuario_id');
    if (!userId) {
      return alert('Usuario no autenticado');
    }
    formData.append('usuario_id', userId);


    try {
      const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/avatar/uploadAvatar.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        //const newAvatarUrl = `http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/${result.avatar}`;
        const newAvatarUrl = result.avatar;


        // Guarda la nueva URL en localStorage
        localStorage.setItem('avatar_url', newAvatarUrl);

        // Actualiza el avatar en el icono de la barra de navegación
        if (userIcon.tagName === 'IMG') {
          userIcon.src = 'http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/' + newAvatarUrl;
        }

        showToast('Avatar actualizado', 'success');
        closePopup(overlay, popup);
      } else {
        alert(result.message || 'Error al actualizar avatar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  });

  popupFooter.appendChild(cancelButton);
  popupFooter.appendChild(saveButton);

  popup.appendChild(popupHeader);
  popup.appendChild(popupBody);
  popup.appendChild(popupFooter);

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  overlay.classList.add('show');
  popup.classList.add('show');



}

// Cerrar el popup
function closePopup(overlay, popup) {
  overlay.classList.remove('show');
  popup.classList.remove('show');
  setTimeout(() => {
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  }, 300);
}

/*
function updateNotifications(count) {
  const badge = document.getElementById('notif-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}*/
/*
window.onload = function() {
  // Aquí puedes colocar tus simulaciones o lógicas de notificación
  setTimeout(() => updateNotifications(1), 2000);
  setTimeout(() => updateNotifications(5), 4000);
  setTimeout(() => updateNotifications(0), 6000);
};*/

export async function cargarInvitaciones(notifList, notifBadge) {
  try {
    const invitations = await getInvitations();

    notifList.innerHTML = ''; // Limpia la lista antes

    for (const inv of invitations) {
      crearNotificacionDeInvitacion(inv, notifList, notifBadge);
      console.log(inv);
    }

    // Actualizar contador
    notifBadge.textContent = invitations.length;
    notifBadge.classList.toggle('hidden', invitations.length === 0);

  } catch (error) {
    console.error('Error al cargar las invitaciones:', error);
  }
}

// Función para manejar la creación de notificaciones
export function crearNotificacionDeInvitacion(inv, notifList, notifBadge) {
  const {
    id,
    nombre_objeto,
    nombre_espacio_trabajo,
    nombre_remitente,
    avatar_url_remitente,
    tablero_id,
    mapa_id,
  } = inv;

  const nombreRemitente = nombre_remitente || 'Usuario desconocido';
  const avatarRemitente = avatar_url_remitente
    ? `http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/${avatar_url_remitente}`
    : 'http://localhost/UniteWork/unitework-dev/frontend/public/img/uploads/usuarios/default-avatar.png';

  // Detectar tipo de invitación y ajustar texto
  let textoInvitacion = '';
  let nombreObjeto = '';

  if (tablero_id) {
    textoInvitacion = 'Te han invitado a un tablero';
    nombreObjeto = `${nombre_objeto} en ${nombre_espacio_trabajo}`;
  } else if (mapa_id) {
    textoInvitacion = 'Te han invitado a un mapa mental';
    nombreObjeto = `${nombre_objeto} en ${nombre_espacio_trabajo}`;
  } else {
    textoInvitacion = 'Te han invitado a un espacio de trabajo';
    nombreObjeto = nombre_espacio_trabajo;
  }

  const aceptar = async (li) => {
    try {
      await acceptInvitation(id);
      socket?.emit('nuevoWorkspace', { nombre: nombreObjeto, descripcion: '' }); // Ajusta si quieres enviar algo
      li.remove();
      updateBadge();
    } catch (err) {
      console.error('Error al aceptar invitación:', err);
    }
  };

  const rechazar = async (li) => {
    try {
      await denyInvitation(id);
      li.remove();
      updateBadge();
    } catch (err) {
      console.error('Error al rechazar invitación:', err);
    }
  };

  const li = crearNotificacion(
    textoInvitacion,
    nombreRemitente,
    `(${nombreObjeto})`,
    'fa-solid fa-envelope-open-text',
    'invitacion',
    avatarRemitente,
    aceptar,
    rechazar
  );

  notifList.appendChild(li);
  updateBadge();

  function updateBadge() {
    const count = notifList.querySelectorAll('.notif-item').length;
    notifBadge.textContent = count;
    notifBadge.classList.toggle('hidden', count === 0);
  }
}

//connectSocket();
// Escuchar nuevas invitaciones (solo una vez)

export function crearNotificacion(
  texto,
  negrita = null,
  cursiva = null,
  iconClass = 'fa-regular fa-bell',
  tipo = 'normal',
  avatarUrl = null,
  onAceptar = null,
  onRechazar = null
) {
  const li = document.createElement('li');
  li.classList.add('notif-item');

  // Contenedor para imagen y contenido
  const contenedor = document.createElement('div');
  contenedor.classList.add('notif-contenedor');

  // Contenedor de la imagen (Avatar)
  const contenedorAvatar = document.createElement('div');
  contenedorAvatar.classList.add('notif-avatar-container');

  // Avatar si está disponible
  if (avatarUrl) {
    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.alt = 'Avatar';
    avatar.classList.add('notif-avatar');
    contenedorAvatar.appendChild(avatar);
  }

  // Contenedor del icono y contenido
  const contenedorTexto = document.createElement('div');
  contenedorTexto.classList.add('notif-texto-container');


  // Contenido del mensaje
  const contenido = document.createElement('span');

  if (negrita) {
    const strong = document.createElement('strong');
    strong.textContent = negrita + ' ';
    contenido.appendChild(strong);
  }

  contenido.appendChild(document.createTextNode(texto));

  if (cursiva) {
    const spanCursiva = document.createElement('span');
    spanCursiva.id = 'spanCursiva';
    spanCursiva.textContent = ' ' + cursiva;
    contenido.appendChild(spanCursiva);
  }

  contenedorTexto.appendChild(contenido);

  // Añadir los contenedores al principal
  contenedor.appendChild(contenedorAvatar);
  contenedor.appendChild(contenedorTexto);

  // Añadir contenedor al li
  li.appendChild(contenedor);

  // Botones de acción solo para invitaciones
  if (tipo === 'invitacion') {
    const acciones = document.createElement('div');
    acciones.classList.add('notif-actions');

    const btnAceptar = document.createElement('button');
    btnAceptar.textContent = 'Aceptar';
    btnAceptar.classList.add('btn-notif', 'btn-aceptarNotif');
    btnAceptar.addEventListener('click', async (e) => {
      e.stopPropagation();
      //acceptInvitation();
      if (typeof onAceptar === 'function') await onAceptar(li);
    });

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Rechazar';
    btnCancelar.classList.add('btn-notif', 'btn-cancelarNotif');
    btnCancelar.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (typeof onRechazar === 'function') await onRechazar(li);
    });

    acciones.appendChild(btnAceptar);
    acciones.appendChild(btnCancelar);
    li.appendChild(acciones);
  }



  return li;
}




export function mostrarPopupDetallesInvitacion({ titulo, mensaje, tipo }) {
  const overlay = document.createElement('div');
  overlay.classList.add('invite-popup');

  const container = document.createElement('div');
  container.classList.add('invite-popup-container');

  // Botón de cerrar (icono X de FontAwesome)
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('invite-close-btn');

  // Crear el icono <i> manualmente
  const icon = document.createElement('i');
  icon.classList.add('fas', 'fa-times');

  closeBtn.title = 'Cerrar';
  closeBtn.setAttribute('aria-label', 'Cerrar');

  closeBtn.appendChild(icon);

  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });


  const h2 = document.createElement('h2');
  h2.textContent = titulo;

  const p = document.createElement('p');
  p.textContent = mensaje;

  const buttonsDiv = document.createElement('div');
  buttonsDiv.classList.add('invite-buttons');

  const aceptarBtn = document.createElement('button');
  aceptarBtn.classList.add('invite-send');
  aceptarBtn.textContent = 'Aceptar';

  aceptarBtn.addEventListener('click', () => {
    //acceptInvitation();
    overlay.remove();
  });

  const rechazarBtn = document.createElement('button');
  rechazarBtn.classList.add('invite-rechazar');
  rechazarBtn.textContent = 'Rechazar';
  rechazarBtn.addEventListener('click', () => {
    overlay.remove();
  });

  buttonsDiv.appendChild(aceptarBtn);
  buttonsDiv.appendChild(rechazarBtn);

  // Añadir botón de cerrar al contenedor
  container.appendChild(closeBtn);
  container.appendChild(h2);
  container.appendChild(p);
  container.appendChild(buttonsDiv);
  overlay.appendChild(container);

  document.body.appendChild(overlay);
}


