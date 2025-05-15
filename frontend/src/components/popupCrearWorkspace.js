import { showToast } from '../../public/js/validator/regex.js';
import { WorkspaceCard } from './workspaceCard.js';
import { myWorkspacesPage } from '../pages/myworkspacesPage.js';
import { createWorkspaces } from '../js/workspaces.js';
import { socket } from '../js/socket.js';

export function CreateWorkspaceModal(botonCrear) {
    // Eliminar popup previo si existe
    const popupPrevio = document.getElementById('popupCrearWorkspace');
    if (popupPrevio) popupPrevio.remove();

    const popup = document.createElement('div');
    popup.className = 'workspace-popup';
    popup.id = 'popupCrearWorkspace';

    popup.classList.add('mostrar');
    popup.classList.remove('ocultar');


    setTimeout(() => {
        popup.classList.add('animate-popup');
    }, 50);

    
    const arrow = document.createElement('div');
    arrow.className = 'popup-arrow-create-workspace';

    const title = document.createElement('h3');
    title.textContent = 'Crear nuevo espacio de trabajo';

    const labelTitulo = document.createElement('label');
    labelTitulo.textContent = 'Título *';

    const inputTitulo = document.createElement('input');
    inputTitulo.placeholder = 'Ej. Proyecto Alfa';

    const labelDescripcion = document.createElement('label');
    labelDescripcion.textContent = 'Descripción (opcional)';

    const inputDescripcion = document.createElement('textarea');
    inputDescripcion.rows = 2;
    inputDescripcion.placeholder = 'Descripción del espacio...';

    const acciones = document.createElement('div');
    acciones.className = 'acciones-popup';

    const btnCrear = document.createElement('button');
    btnCrear.textContent = 'Crear';
    btnCrear.className = 'crear-lista-confirmar';

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'crear-lista-cancelar';

    acciones.appendChild(btnCrear);
    acciones.appendChild(btnCancelar);

    popup.append(arrow, title, labelTitulo, inputTitulo, labelDescripcion, inputDescripcion, acciones);
    document.body.appendChild(popup);


    // Posicionar debajo del botón
    const rect = botonCrear.getBoundingClientRect();
    const popupWidth = 450;
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 8;

    if (left + popupWidth > window.innerWidth - 10) {
        left = window.innerWidth - popupWidth - 10;
    }

    popup.style.position = 'fixed';
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    inputTitulo.focus();

    // Cierre
    function cerrarPopup() {
        popup.classList.remove('animate-popup');
        popup.classList.add('fade-out');
            // Ocultar popup con fade-out y luego remover del DOM si quieres
    popup.classList.remove('mostrar');
    popup.classList.add('ocultar');
        popup.addEventListener('animationend', () => {
            popup.remove();
        }, { once: true });
        document.removeEventListener('click', handleCerrar);
    }


    btnCancelar.addEventListener('click', cerrarPopup);

    function handleCerrar(e) {
        if (e.key === 'Escape') cerrarPopup();
        if (!popup.contains(e.target) && e.target !== botonCrear) cerrarPopup();
    }

    setTimeout(() => document.addEventListener('click', handleCerrar));
    inputDescripcion.addEventListener('keydown', e => {
        if (e.key === 'Enter') btnCrear.click();
    });

    btnCrear.addEventListener('click', async () => {
        const nombre = inputTitulo.value.trim();
        const descripcion = inputDescripcion.value.trim();

        if (!nombre) {
            showToast('⚠️ Escribe un título válido');
            return;
        }

        try {
            await createWorkspaces(nombre, descripcion, popup);
            socket?.emit('nuevoWorkspace', { nombre, descripcion });
            cerrarPopup();
        } catch (err) {
            console.error(err);
            showToast('❌ Error al crear espacio', 'error');
        }
    });

    return popup;

}
