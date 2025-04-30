import { showToast } from "../../public/js/validator/regex.js";
import { deleteWorkspaces } from "../../public/js/workspaces.js";
import { mostrarDetallesWorkspace } from "./popupUpdateWorkspace.js";
import page from 'page';

export function WorkspaceCard(ws) {


    const card = document.createElement('div');
    card.className = 'workspace-card';

    const header = document.createElement('div');
    header.className = 'workspace-header';

    const name = document.createElement('h3');
    name.textContent = ws.nombre;

    // Menú de opciones
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-container';

    const dots = document.createElement('i');
    dots.className = 'fa-solid fa-ellipsis';

    const menu = document.createElement('ul');
    menu.className = 'workspace-menu hidden';

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
    if (ws.rol !== 'admin') {
        menu.appendChild(salir);
    } else {
        menu.appendChild(invitar);
        menu.appendChild(eliminar);
    }

    menuContainer.appendChild(dots);
    menuContainer.appendChild(menu);

    // Toggle del menú
    menuContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', () => {
        menu.classList.add('hidden');
    });

    header.appendChild(name);
    header.appendChild(menuContainer);

    const divActividad = document.createElement('div');
    divActividad.id = 'divActividad';


    const actividadIco = document.createElement('i');
    actividadIco.className = 'fa-regular fa-clock';
    actividadIco.id = 'actividadIco';
    const actividad = document.createElement('p');
    actividad.className = 'actividad';
    actividad.textContent = `Última actividad: ${ws.ultima_actividad_relativa}`;

    divActividad.appendChild(actividadIco);
    divActividad.appendChild(actividad);

    const horizontalBar = document.createElement('hr');
    horizontalBar.id = 'hrWorkSpace';


    //////////////


    const divTableroInfo = document.createElement('div');
    const icoTablero = document.createElement('i');
    icoTablero.id = 'icoTablero';
    const pTablero = document.createElement('p');
    pTablero.textContent = ws.num_tableros + " tableros activos";
    divTableroInfo.id = 'divTableroInfo';
    icoTablero.className = 'fa-solid fa-table';

    divTableroInfo.appendChild(icoTablero);
    divTableroInfo.appendChild(pTablero);

    const divMentalMapInfo = document.createElement('div');
    const icoMentalMap = document.createElement('i');
    icoMentalMap.id = 'icoMentalMap';
    const pMentalMap = document.createElement('p');
    pMentalMap.textContent = ws.numero_mapas_mentales + " mapas mentales activos";
    divMentalMapInfo.id = 'divMentalMapInfo';
    icoMentalMap.className = 'fa-regular fa-sticky-note';

    divMentalMapInfo.appendChild(icoMentalMap);
    divMentalMapInfo.appendChild(pMentalMap);

    /*
        const divMemberInfo = document.createElement('div');
        const icoMemberInfo = document.createElement('i');
        icoMemberInfo.id = 'icoMentalMap';
        const pMemberInfo = document.createElement('p');
        pMemberInfo.textContent = '(mapas mentales activos)'
        divMemberInfo.id = 'divMentalMapInfo';
        icoMemberInfo.className = 'fa-regular fa-sticky-note';
    */
    const divInfo = document.createElement('div');
    divInfo.id = 'divInfo';
    const icoInfo = document.createElement('i');
    icoInfo.id = 'icoInfo';
    icoInfo.className = 'fa-solid fa-user-group';
    const info = document.createElement('p');
    info.id = 'pInfo';
    info.textContent = `${ws.numero_miembros}`;

    divInfo.appendChild(icoInfo);
    divInfo.appendChild(info);

    const footer = document.createElement('div');
    footer.className = 'workspace-footer';

    const divRol = document.createElement('div');
    divRol.id = 'divRol';

    const rol = document.createElement('span');
    rol.id = 'rolSpan';
    rol.className = `rol ${ws.rol}`;
    rol.textContent = ws.rol === 'admin' ? 'Administrador' : 'Miembro';

    divRol.appendChild(rol);

    const enterBtn = document.createElement('button');
    enterBtn.id = 'enter-btn';
    enterBtn.title = 'Entrar';

    const enterIco = document.createElement('i');
    enterIco.className = 'fa-solid fa-right-to-bracket';

    enterBtn.appendChild(enterIco);

    // Aquí es donde se conecta la acción de "Entrar"
    enterBtn.addEventListener('click', () => {
        page(`/workspace/${ws.id}`); // Redirige a la página del workspace con el ID del workspace
    });


    footer.appendChild(divInfo);
    footer.appendChild(divRol);
    footer.appendChild(enterBtn);

    card.appendChild(header);
    card.appendChild(divActividad);
    card.appendChild(horizontalBar);
    card.appendChild(divTableroInfo);
    card.appendChild(divMentalMapInfo);
    card.appendChild(footer);


    detalle.addEventListener('click', () => {
        mostrarDetallesWorkspace(ws);
    });


    eliminar.addEventListener('click', async () => {
        const confirmado = await mostrarPopupConfirmacion();
        if (!confirmado) return;

        try {
            await deleteWorkspaces(ws.id);
            card.remove(); // Eliminar la tarjeta del DOM directamente
        } catch (error) {
            console.error("Error al eliminar el tablero:", error);
        }
    });




    return card;
}

export async function mostrarPopupConfirmacion() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'popup';

        const mensajeEl = document.createElement('p');
        mensajeEl.textContent = "¿Estás seguro de que quieres eliminarlo?";

        const botones = document.createElement('div');
        botones.className = 'popup-buttons';

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.className = 'btn-cancelar';

        const btnConfirmar = document.createElement('button');
        btnConfirmar.textContent = 'Eliminar';
        btnConfirmar.className = 'btn-confirmar';

        botones.appendChild(btnCancelar);
        botones.appendChild(btnConfirmar);

        popup.appendChild(mensajeEl);
        popup.appendChild(botones);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        btnCancelar.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });

        btnConfirmar.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
    });
}
