import { showToast } from "../../public/js/validator/regex.js";
import { deleteWorkspaces, salirseDelWorkspace, updateWorkspace } from "../js/workspaces.js";
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


    const salir = document.createElement('li');
    salir.textContent = 'Salir del espacio';

    const eliminar = document.createElement('li');
    eliminar.textContent = 'Eliminar espacio';
    eliminar.id = 'eliminarLi';

    menu.appendChild(detalle);
    if (ws.rol !== 'admin') {
        menu.appendChild(salir);
    } else {
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
        popupEditarWorkspace(ws);
    });

    salir.addEventListener('click', () => {
        salirseDelWorkspace(ws.id);
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

    card.addEventListener('click', () => {
        page(`/workspace/${ws.id}`); // Redirige a la página del workspace con el ID del workspace
    });

    ws.__domRef = {
        nameElement: name,
        cardElement: card
    };

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

export function popupEditarWorkspace(ws) {
    // Eliminar cualquier popup anterior
    const existingPopup = document.getElementById('popupEditarWorkspace');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'popupEditarWorkspace';
    popup.className = 'popup-editar-tarea';

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'taskEdit-content';

    // Contenedor del título
    const tituloContainer = document.createElement('div');
    tituloContainer.id = 'tituloContainer';

    const titulo = document.createElement('h3');
    titulo.textContent = ws.nombre;
    titulo.style.margin = 0;

    const inputTitulo = document.createElement('input');
    inputTitulo.type = 'text';
    inputTitulo.style.display = 'none';
    inputTitulo.value = ws.nombre;
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
        if (nuevoTitulo && nuevoTitulo !== ws.nombre) {
            ws.nombre = nuevoTitulo;
            titulo.textContent = nuevoTitulo;
            await updateWorkspace(ws.nombre, null, ws.id);

            if (ws.__domRef && ws.__domRef.nameElement) {
                ws.__domRef.nameElement.textContent = nuevoTitulo;
                console.log(ws.__domRef);

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

    if (ws.rol === 'admin') {
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
    console.log(ws);
    const rol = ws.rol === 'admin' ? 'Administrador' : 'Miembro';
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
    inputDescrip.value = ws.descripcion || '';
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
    actividadSpan.textContent = ws.ultima_actividad_relativa;
    actividadSpan.id = 'inputLabelActividad';

    // Añade el span al label
    inputLabelActividad.appendChild(actividadSpan);

    // Añade los iconos y label al div
    divActividad.append(icoActividad, inputLabelActividad);

    // Acciones
    const acciones = document.createElement('div');
    acciones.className = 'taskEdit-actions';

    const guardar = document.createElement('button');
    guardar.textContent = 'Guardar';
    guardar.className = 'taskEdit-confirmar';

    guardar.addEventListener('click', async () => {
        ws.descripcion = inputDescrip.value.trim();
        await updateWorkspace(ws.nombre, ws.descripcion, ws.id);
        //fetchAndRenderWorkspaces(); // si lo tienes definido
        popup.remove();
    });

    const cancelar = document.createElement('button');
    cancelar.textContent = 'Cancelar';
    cancelar.className = 'taskEdit-cancelar';

    cancelar.addEventListener('click', () => popup.remove());

    borrarButton.addEventListener('click', async () => {
        await deleteWorkspaces(ws.id);
        //fetchAndRenderWorkspaces(); // si lo tienes definido
        popup.remove();
    });

    acciones.append(cancelar, guardar);
    content.append(divTop, rolWorkspace, hr, divDescrip, inputDescrip, divActividad, acciones);
    popup.append(overlay, content);
    document.body.appendChild(popup);

    overlay.addEventListener('click', () => popup.remove());
}
