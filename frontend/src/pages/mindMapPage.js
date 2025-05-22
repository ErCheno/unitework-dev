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
import { crearNodo, fetchMindMaps, fetchNodos, getNodoPadre, selectMindMap } from '../js/mindMap.js';
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
    parrafoCrear.textContent = 'Crear nodo hijo';
    botonCrear.append(icoCrear, parrafoCrear);



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

    // Crear el div requerido por GoJS (Mind-Elixir)
    const mindmapContainer = document.createElement('div');
    mindmapContainer.id = 'mindmap-list';
    mindmapContainer.style.width = '100%';
    mindmapContainer.style.height = '600px';
    mindmapContainer.style.border = '1px solid #ccc';
    mindmapContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    // Insertarlo al DOM antes de inicializar Mind-Elixir
    container.append(divConjuntoArriba, hrMindmap, mindmapContainer);
    contentDiv.appendChild(container);

    // Obtener nodos reales desde el backend y convertirlos a estructura compatible
    const nodos = await fetchNodos(mapId);
    const treeData = buildMindElixirTree(nodos);

    // Inicializar Mind-Elixir con los datos del backend y guardar instancia
    const mindInstance = initMindMap(mindmapContainer, treeData);

    botonCrear.addEventListener('click', () => {
        // Si ya hay un popup abierto, lo cerramos
        const existing = document.querySelector('.mindnode-popup');
        if (existing) existing.remove();

        // Obtener posición del botón para situar el popup
        const rect = botonCrear.getBoundingClientRect();

        // Crear popup, pasando mindInstance y padreId nulo para crear raíz o hijo
        popupCrearNodo(mapId, null, mindInstance)
            .then(nuevoNodo => {
                if (nuevoNodo && nuevoNodo.id) {
                    console.log("Nodo creado:", nuevoNodo);
                    // El nodo ya se añadió al mindInstance dentro de popupCrearNodo
                }
            })
            .then(() => {
                // Posicionar el popup justo después de crear y agregarlo
                const popup = document.querySelector('.mindnode-popup');
                if (popup) {
                    popup.style.position = 'absolute';
                    popup.style.top = `${rect.bottom + window.scrollY}px`;
                    popup.style.left = `${rect.left + window.scrollX}px`;
                    popup.style.zIndex = '1000'; // Por si acaso que quede encima
                }
            });
    });
    const siblingBtn = document.getElementById('cm-add_sibling');

    siblingBtn.addEventListener('click', async () => {
        await crearHermanoNodo(mapId, mindInstance);
    });


    const child = document.getElementById('cm-add_child');
    child.addEventListener('click', async () => {
        crearHijoNodo(mapId, mindInstance);
    });
    child.addEventListener('keydown', async (event) => {
        if (event.key === 'Tab') {
            crearHijoNodo(mapId, mindInstance);

        }

    });


    return container;

}


export function buildMindElixirTree(nodos) {
    const nodeMap = {};
    const rootNodes = [];

    nodos.forEach(nodo => {
        nodeMap[nodo.id] = {
            id: nodo.id.toString(),
            topic: nodo.contenido,
            data: {
                id_real: nodo.id,
                padre_id: nodo.padre_id
            },
            children: []
        };
    });

    nodos.forEach(nodo => {
        if (nodo.padre_id === null) {
            rootNodes.push(nodeMap[nodo.id]);
        } else if (nodeMap[nodo.padre_id]) {
            nodeMap[nodo.padre_id].children.push(nodeMap[nodo.id]);
        }
    });

    return {
        nodeData: {
            id: 'root',
            topic: 'Mapa principal',
            children: rootNodes
        },
        linkData: {}
    };
}



export async function popupCrearNodo(mapaId, padreId, mindInstance) {
    // Si padreId no está definido, lo obtenemos desde backend (el nodo raíz)
    if (!padreId) {
        const nodoRaiz = await getNodoPadre(mapaId);
        if (nodoRaiz) padreId = nodoRaiz.id.toString();
        else padreId = null; // o "" según lo que acepte tu lógica de MindElixir
    }
    return new Promise((resolve) => {
        const popup = document.createElement("div");
        popup.classList.add("mindnode-popup");
        setTimeout(() => popup.classList.add("animate-popup-nodo"), 50);

        const flecha = document.createElement("div");
        flecha.classList.add("popup-arrow-nodo");
        popup.appendChild(flecha);

        const form = document.createElement("form");

        const title = document.createElement("h3");
        title.textContent = "Crear nodo hijo";
        form.appendChild(title);

        const inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group");

        const label = document.createElement("label");
        label.textContent = "Contenido del nodo";
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Escribe el contenido...";
        input.required = true;

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        form.appendChild(inputGroup);

        const crearBtn = document.createElement("button");
        crearBtn.type = "submit";
        crearBtn.id = 'botonCrearMindmap';
        crearBtn.textContent = "Crear";
        form.appendChild(crearBtn);

        popup.appendChild(form);

        function closePopup() {
            popup.classList.remove("animate-popup-nodo");
            popup.classList.add("fade-out-nodo");
            popup.addEventListener("animationend", () => popup.remove(), { once: true });
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        }

        function handleClickOutside(e) {
            if (!popup.contains(e.target)) closePopup();
        }

        function handleEscape(e) {
            if (e.key === "Escape") closePopup();
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const contenido = input.value.trim();

            if (!contenido) {
                alert("El contenido no puede estar vacío.");
                return;
            }

            try {
                // Crear el nodo en el backend
                const nodoCreado = await crearNodo(mapaId, contenido, padreId);
                console.log(nodoCreado);

                if (nodoCreado && nodoCreado.nodo.id) {
                    // 🔄 Volver a obtener todos los nodos actualizados
                    const nodosActualizados = await fetchNodos(mapaId);
                    const newTree = buildMindElixirTree(nodosActualizados);
                    // 🔁 Actualizar el mindInstance
                    mindInstance.refresh(newTree);

                    // Luego en consola:
                    closePopup(); // Cerrar popup
                    resolve(nodoCreado);
                } else {
                    alert("No se pudo crear el nodo.");
                }
            } catch (error) {
                console.error("Error al crear nodo:", error);
                alert("Hubo un error al crear el nodo.");
            }
        });



        resolve(popup);
        document.body.appendChild(popup);
    });
}

export async function crearNodoFuncion(mapaId, padreId, mindInstance) {

    try {
        // Crear el nodo en el backend
        const nodoCreado = await crearNodo(mapaId, "Nodo nuevo", padreId);
        console.log(nodoCreado);

        if (nodoCreado && nodoCreado.nodo.id) {
            // 🔄 Volver a obtener todos los nodos actualizados
            const nodosActualizados = await fetchNodos(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados);

            // 🔁 Actualizar el mindInstance
            mindInstance.refresh(newTree);

        } else {
            alert("No se pudo crear el nodo.");
        }
    } catch (error) {
        console.error("Error al crear nodo:", error);
        alert("Hubo un error al crear el nodo.");
    }

}


export async function crearHermanoNodo(mapaId, mindInstance) {
    const nodoActual = mindInstance.currentNode;

    if (!nodoActual) {
        alert("Selecciona un nodo primero.");
        return;
    }

    const padreId = nodoActual.data?.padre_id ?? null;

    try {
        // Crear el nuevo nodo en el backend
        const nuevoNodo = await crearNodo(mapaId, "Nuevo hermano", padreId);

        if (nuevoNodo && nuevoNodo.nodo?.id) {
            // Recargar nodos actualizados
            const nodosActualizados = await fetchNodos(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados);
            mindInstance.refresh(newTree);
        } else {
            alert("No se pudo crear el nodo.");
        }
    } catch (error) {
        console.error("Error al crear nodo hermano:", error);
        alert("Hubo un error al crear el nodo hermano.");
    }
}

export async function crearHijoNodo(mapaId, mindInstance) {
    const nodoActual = mindInstance.currentNode;

    if (!nodoActual) {
        alert("Selecciona un nodo primero.");
        return;
    }

    const padreId = nodoActual.data?.id_real ?? null; // ID real desde la base de datos

    try {
        // Crear nuevo nodo hijo en el backend
        const nuevoNodo = await crearNodo(mapaId, "Nuevo hijo", padreId);

        if (nuevoNodo && nuevoNodo.nodo?.id) {
            // Recargar nodos desde el backend
            const nodosActualizados = await fetchNodos(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados);
            mindInstance.refresh(newTree);
        } else {
            alert("No se pudo crear el nodo hijo.");
        }
    } catch (error) {
        console.error("Error al crear nodo hijo:", error);
        alert("Hubo un error al crear el nodo hijo.");
    }
}
