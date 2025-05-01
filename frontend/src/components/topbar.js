import page from 'page';
import { logoutUser } from '../../public/js/auth.js';
import { showToast } from "../../public/js/validator/regex.js";

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
  logoImg.alt = 'Logo de UWrk';

  const tituloH1 = document.createElement('h1');
  tituloH1.textContent = 'UWrk';

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
    console.log(avatarUrl); // Verifica si la URL es correcta

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

  // Función para crear una notificación
  function crearNotificacion(texto, negrita = null, cursiva = null, iconClass = 'fa-regular fa-bell') {
    const li = document.createElement('li');
    li.classList.add('notif-item');

    const icon = document.createElement('i');
    icon.className = iconClass + ' notif-icon';
    li.appendChild(icon);

    if (negrita || cursiva) {
      if (negrita) {
        const strong = document.createElement('strong');
        strong.textContent = negrita + ' ';
        li.appendChild(strong);
      }
      const textoPlano = document.createTextNode(texto);
      li.appendChild(textoPlano);
      if (cursiva) {
        const em = document.createElement('em');
        em.textContent = ' ' + cursiva;
        li.appendChild(em);
      }
    } else {
      const span = document.createElement('span');
      span.textContent = texto;
      li.appendChild(span);
    }

    // Mostrar como toast al hacer clic
    li.addEventListener('click', () => {
      const mensaje = (negrita ? negrita + ' ' : '') + texto + (cursiva ? ' ' + cursiva : '');
      showToast(mensaje, 'info');
    });

    return li;
  }



  notifList.appendChild(crearNotificacion('te ha mencionado en un comentario', 'Ana', null, 'fa-solid fa-at'));
  notifList.appendChild(crearNotificacion('Tu tablero fue actualizado', null, 'Marketing', 'fa-solid fa-table-columns'));
  notifList.appendChild(crearNotificacion('Tienes una nueva invitación', null, null, 'fa-solid fa-envelope-open-text'));

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
  dashboardA.href = '#/dashboard';
  dashboardA.textContent = 'Novedades';
  dasboardLi.appendChild(dashboardA);

  const kanbanLi = document.createElement('li');
  const kanbanA = document.createElement('a');
  kanbanA.href = '#/kanban';
  kanbanA.textContent = 'Tablero Kanban';
  kanbanLi.appendChild(kanbanA);

  const gruposLi = document.createElement('li');
  const gruposA = document.createElement('a');
  gruposA.href = '#/groups';
  gruposA.textContent = 'Grupos';
  gruposLi.appendChild(gruposA);

  const mapasmentalesLi = document.createElement('li');
  const mapasmentalesA = document.createElement('a');
  mapasmentalesA.href = '#/kanban';
  mapasmentalesA.textContent = 'Tablero Kanban';
  mapasmentalesLi.appendChild(mapasmentalesA);

  // Añadir al menú principal
  menu.appendChild(dasboardLi);
  menu.appendChild(kanbanLi);
  menu.appendChild(gruposLi);
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
        console.log('Imagen válida');
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
          userIcon.src = newAvatarUrl;
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

function updateNotifications(count) {
  const badge = document.getElementById('notif-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}
/*
window.onload = function() {
  // Aquí puedes colocar tus simulaciones o lógicas de notificación
  setTimeout(() => updateNotifications(1), 2000);
  setTimeout(() => updateNotifications(5), 4000);
  setTimeout(() => updateNotifications(0), 6000);
};*/