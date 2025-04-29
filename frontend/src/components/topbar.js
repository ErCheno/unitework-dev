import page from 'page';
import { logoutUser } from '../../public/js/auth.js';
import { showToast } from "../../public/js/validator/regex.js";


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
  const userIcon = document.createElement('i');
  userIcon.className = 'fa-regular fa-user';
  userA.appendChild(userIcon);
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
  notifA.appendChild(notifIcon);
  notifLi.appendChild(notifA);

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
  avatarImg.src = ''; // Imagen actual
  avatarImg.alt = 'Avatar';

  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.accept = 'image/*';
  inputFile.style.display = 'none';

  const editIcon = document.createElement('i');
  editIcon.id = 'edit-icon';
  editIcon.className = 'fa-solid fa-pencil';

  const avatarInput = document.createElement('input');
  avatarInput.type = 'file';
  avatarInput.accept = 'image/*';
  avatarInput.style.display = 'none';
  document.body.appendChild(avatarInput);

  editIcon.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecciona una imagen válida.');
      avatarInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  avatarContainer.appendChild(avatarImg);
  avatarContainer.appendChild(editIcon);

  const headerInfo = document.createElement('div');
  headerInfo.className = 'header-info';
  const headerName = document.createElement('h1');
  headerName.textContent = 'Nombre de Usuario';
  const headerEmail = document.createElement('p');
  headerEmail.textContent = 'user@example.com';
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
    formData.append('usuario_id', localStorage.getItem('usuario_id')); // o donde guardes el ID

    try {
      const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/avatar/uploadAvatar.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        avatarImg.src = `http://localhost/uploads/usuarios/${result.avatar}`;
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

  editIcon.addEventListener('click', () => inputFile.click());

  inputFile.addEventListener('change', () => {
    const file = inputFile.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => avatarImg.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });
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
