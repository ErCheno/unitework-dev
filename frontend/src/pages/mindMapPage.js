import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { scrollHorizontal, setupSortable, setupSortableKanban, setupSortableList } from '../components/dragAnimation.js';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { cargarTareas, TaskCard } from '../components/taskCard.js';
import { getTareas, crearEstado, getEstado, crearTarea, moverTareas, moverLista, modificarTarea, deleteTask, modificarLista, deleteList } from '../js/task.js';
import { cambiarRolUsuario, fetchBoards, getUsuariosDelTablero, getUsuariosDisponibles, putBoard, selectBoard } from '../js/board.js';
import { mostrarPopupConfirmacion } from '../components/workspaceCard.js';
import { socketMoveList, socketPutList } from '../js/socketsEvents.js';
import { socket } from '../js/socket.js';
import { fetchMindMaps, selectMindMap } from '../js/mindMap.js';
import { initMindMap } from '../components/mindMapView.js';

export async function MindMapPage(mapId) {
    cleanupView();

    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }
    contentDiv.textContent = '';

    const container = document.createElement('div');
    container.id = 'container';

    const navbar = Navbar();
    const topbar = TopNavbar();
    container.append(navbar, topbar);

    const mapa = await selectMindMap(mapId);

    const divConjuntoArriba = document.createElement('div');
    divConjuntoArriba.id = 'divConjuntoArriba';

    const miembrosContainer = document.createElement('div');
    miembrosContainer.id = 'avatar-container';

    const titleContainer = document.createElement('div');
    titleContainer.id = 'tittleContainer';

    const title = document.createElement('h3');
    console.log(mapa);
    title.textContent = mapa.titulo;
    title.id = 'tituloKanban';
    title.style.margin = 0;

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.style.display = 'none';
    inputTitle.className = 'input-editar-titulo';

    const iconoLapiz = document.createElement('i');
    iconoLapiz.className = 'fa-solid fa-pen';
    iconoLapiz.style.cursor = 'pointer';

    iconoLapiz.addEventListener('click', () => {
        inputTitle.value = title.textContent;
        title.style.display = 'none';
        iconoLapiz.style.display = 'none';
        inputTitle.style.display = 'inline-block';
        inputTitle.focus();
    });

    inputTitle.addEventListener('blur', () => finalizarEdicion());
    inputTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finalizarEdicion();
        }
    });

    async function finalizarEdicion() {
        const nuevoTitulo = inputTitle.value.trim();
        title.style.display = 'block';
        iconoLapiz.style.display = 'inline-block';
        inputTitle.style.display = 'none';
        //await putMindMap(mindmap.id, nuevoTitulo);
        title.textContent = nuevoTitulo;
    }

    titleContainer.append(title, inputTitle, iconoLapiz);

    const botonCrear = document.createElement('button');
    botonCrear.id = 'crearNodo';
    const icoCrear = document.createElement('i');
    icoCrear.className = 'fa-solid fa-plus';
    icoCrear.id = 'icoCrear';
    const parrafoCrear = document.createElement('span');
    parrafoCrear.id = 'parrafoCrear';
    parrafoCrear.textContent = 'Crear nodo';
    botonCrear.append(icoCrear, parrafoCrear);

    botonCrear.addEventListener('click', () => {
        popupCrearNodo(botonCrear, mindmapId);
    });

    const botonVolver = document.createElement('button');
    botonVolver.id = 'botonVolver';
    const icoVolver = document.createElement('i');
    icoVolver.className = 'fa-solid fa-chevron-left';
    icoVolver.id = 'icoVolver';
    const parrafoVolver = document.createElement('p');
    parrafoVolver.id = 'parrafoVolver';
    parrafoVolver.textContent = 'Volver';
    botonVolver.append(icoVolver, parrafoVolver);

    botonVolver.addEventListener('click', () => page('/workspace/' + mapa.espacio_trabajo_id));

    const divBotonesArriba = document.createElement('div');
    divBotonesArriba.id = 'divBotonesArriba';
    divBotonesArriba.appendChild(botonCrear);
    divBotonesArriba.appendChild(botonVolver);

    //const usuarios = await getUsuariosDelMapa(mindmapId);
    //const avatarGroup = renderAvatarGroup(usuarios, mindmapId);

    divConjuntoArriba.append(titleContainer, divBotonesArriba);

    const hrMindmap = document.createElement('hr');
    hrMindmap.id = 'hrMindmap';

    // Contenedor principal para el mapa mental
    const mindmapContainer = document.createElement('div');
    mindmapContainer.id = 'mindmap-list';

    container.append(divConjuntoArriba, hrMindmap, mindmapContainer);
    contentDiv.appendChild(container);

    // Aquí puedes llamar a la función para renderizar los nodos del mapa

    const ejemploJson = {
        id: 'root',
        topic: 'Mi Mapa Mental de prueba',
        children: [
            { id: 'node1', topic: 'Nodo 1', children: [] },
            { id: 'node2', topic: 'Nodo 2', children: [] }
        ]
    };
    let mindInstance; // variable global o accesible desde fuera

    setTimeout(() => {
        mindInstance = initMindMap(mindmapContainer, ejemploJson);
    }, 100);

    return container;
}
