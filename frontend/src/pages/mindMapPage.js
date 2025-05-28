import { cleanupView } from '../../public/js/cleanup';
import { Navbar } from '../components/navbar';
import { TopNavbar } from '../components/topbar';
import { showToast } from '../../public/js/validator/regex.js';
import page from 'page';
import { getUsuariosDelTablero } from '../js/board.js';
import { inicializarSocketListeners, refrescarMapaMental, socket } from '../js/socket.js';
import { actualizarPadresLote, cambiarRolUsuarioMapa, crearNodo, deleteNodo, fetchActualizarNodo, fetchCrearPadre, fetchMindMaps, fetchNodos, getNodoPadre, getUsuariosDelMapa, modificarMindMap, selectMindMap } from '../js/mindMap.js';
import { initMindMap } from '../components/mindMapView.js';
import { mostrarPopupInvitacion } from '../components/boardCard.js';
import { mostrarPopupInvitacionMindmap } from '../components/mindMapCard.js';

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
    contentDiv.append(navbar, topbar);

    const mapa = await selectMindMap(mapId);
    const divConjuntoArriba = document.createElement('div');
    divConjuntoArriba.id = 'divConjuntoArriba';

    const miembrosContainer = document.createElement('div');
    miembrosContainer.id = 'avatar-container';

    const titleContainer = document.createElement('div');
    titleContainer.id = 'tittleContainer';

    const title = document.createElement('h3');
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
        if (nuevoTitulo && nuevoTitulo !== mapa.titulo) {
            mapa.titulo = nuevoTitulo;
            title.textContent = nuevoTitulo;
            await modificarMindMap(mapId, nuevoTitulo, null);
            const nodosActualizados = await fetchNodos(mapId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);
            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('modificar-nodo', { mapaId: mapId });

            mindInstance.refresh(newTree);

        }
        title.textContent = nuevoTitulo;
    }
    if (mapa.rol_mapa === 'admin') {
        titleContainer.append(title, inputTitle, iconoLapiz);
    } else {
        titleContainer.append(title, inputTitle);
    }

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

    const botonRecarga = document.createElement('button');
    botonRecarga.id = 'botonRecarga';
    botonRecarga.title = 'Recargar Espacios de trabajo'
    const icoRecarga = document.createElement('i');
    icoRecarga.className = 'fa-solid fa-rotate-right';
    icoRecarga.id = 'icoRecarga';

    botonRecarga.append(icoRecarga);




    const divBotonesArriba = document.createElement('div');
    divBotonesArriba.id = 'divBotonesArriba';

    const botonInvitar = document.createElement('button');
    botonInvitar.id = 'botonInvitar';
    const icoInvitar = document.createElement('i');
    icoInvitar.className = 'fa-solid fa-user-plus';
    icoInvitar.id = 'icoVolver';
    botonInvitar.append(icoInvitar);


    if (mapa.rol_mapa === 'admin') {
        divBotonesArriba.appendChild(botonInvitar);
        botonInvitar.addEventListener('click', () => {
            mostrarPopupInvitacionMindmap(mapa);

        });


    }
    const lineaVertical = document.createElement('div');
    lineaVertical.id = 'lineaVertical';

    divBotonesArriba.appendChild(lineaVertical);
    divBotonesArriba.appendChild(botonCrear);
    divBotonesArriba.appendChild(botonVolver);

    const usuarios = await getUsuariosDelMapa(mapId);
    const avatarGroup = renderAvatarGroup(usuarios, mapa);

    divConjuntoArriba.append(titleContainer, avatarGroup, divBotonesArriba);

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
    const treeData = buildMindElixirTree(nodos, mapa);

    const mindInstance = initMindMap(mindmapContainer, treeData);
    mindInstance.bus.addListener('operation', console.log);
    inicializarSocketListeners(mindInstance);

    mindInstance.bus.addListener('operation', async (op) => {
        if (op.name === 'moveNodeIn') {
            const nodosAMover = op.objs.map(node => ({
                nodo_id: node.data?.db_id || node.id?.slice(2),
                nuevo_padre_id: op.toObj?.data?.db_id || op.toObj?.id?.slice(2) || null,
            }));

            const resultado = await actualizarPadresLote(nodosAMover);
            console.log("Respuesta moverNodos:", resultado);

            const nodosActualizados = await fetchNodos(mapId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);

            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('modificar-nodo', { mapaId: mapId });


            mindInstance.refresh(newTree);
        }
    });


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
    const parent = document.getElementById('cm-add_parent');
    const child = document.getElementById('cm-add_child');
    const removeChild = document.getElementById('cm-remove_child');



    function disableActions() {
        siblingBtn.onclick = null;
        parent.onclick = null;
        child.onclick = null;
        child.onkeydown = null;
        removeChild.onclick = null;
    }

    disableActions();


    siblingBtn.addEventListener('click', async () => {
        crearHermanoNodo(mapId, mindInstance);
    });


    child.addEventListener('click', async () => {
        crearHijoNodo(mapId, mindInstance);
    });

    parent.addEventListener('click', async () => {
        crearPadreNodo(mapId, mindInstance);
    });

    removeChild.addEventListener('click', async () => {
        const selectedNode = mindInstance.currentNode;
        if (!selectedNode || !selectedNode.getAttribute) {
            showToast('Selecciona un nodo para eliminar.', 'error');
            return;
        }

        const fullId = selectedNode.getAttribute('data-nodeid'); // ej. "me125"
        const dbId = fullId.slice(2); // ej. "125"

        try {
            await deleteNodo(dbId);

            // Re-fetch y reconstrucción
            const nodosActualizados = await fetchNodos(mapId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);
            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('crear-nodo', { mapaId: mapId });


            // Actualiza el mindInstance con la nueva estructura
            mindInstance.refresh(newTree);

            showToast('Nodo eliminado correctamente.', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error al eliminar el nodo.', 'error');
        }
    });
    // Escuchar cuando se edita un nodo (pierde el foco)
    // Actualizar al perder el foco
    mindmapContainer.addEventListener('focusin', (event) => {
        const selectedNode = document.querySelector('me-tpc.selected');
        if (selectedNode) {
            const textElement = selectedNode.querySelector('.text');
            const nodeId = selectedNode.getAttribute('data-nodeid')?.slice(2);
            const newText = textElement?.textContent.trim();

            if (nodeId && newText !== undefined) {
                mindInstance.bus.fire('textEdit', nodeId, newText);
            }
        }
    });

    // Actualizar al presionar Enter (keydown)
    mindmapContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();  // Evitar salto de línea en el nodo editable
            const selectedNode = document.querySelector('me-tpc.selected');
            if (selectedNode) {
                const textElement = selectedNode.querySelector('.text');
                const nodeId = selectedNode.getAttribute('data-nodeid')?.slice(2);
                const newText = textElement?.textContent.trim();

                if (nodeId && newText !== undefined) {
                    mindInstance.bus.fire('textEdit', nodeId, newText);
                }
            }
        }
    });

    // Escuchar evento 'textEdit' para actualizar el backend
    mindInstance.bus.addListener('textEdit', async (nodeId, newText) => {

        try {

            if (nodeId == 'root') {
                const resultado = await modificarMindMap(mapId, newText);
                socket.emit('crear-nodo', { mapaId: mapId });

                const tituloKanban = document.getElementById('tituloKanban');
                tituloKanban.textContent = newText;
                if (!resultado && !resultado.success) {
                    showToast('Error al actualizar nodo', 'error');
                }
            } else {
                const resultado = await fetchActualizarNodo(nodeId, newText);
                if (!resultado && !resultado.success) {
                    showToast('Error al actualizar nodo', 'error');
                }
            }


        } catch (error) {
            console.error('Error al actualizar nodo:', error);
            showToast('Error al actualizar nodo', 'error');
        }
    });


    botonRecarga.addEventListener('click', () => {
        refrescarMapaMental(mapId);
    });


    return container;

}
export function buildMindElixirTree(nodos, mapa) {
    const nodeMap = {};
    const rootNodes = [];

    nodos.forEach(nodo => {
        nodeMap[nodo.id] = {
            id: nodo.id.toString(),
            topic: nodo.contenido,
            data: {
                id_real: nodo.id,
                db_id: nodo.id,
                padre_id: nodo.padre_id || null
            },
            children: []
        };
    });

    nodos.forEach(nodo => {
        if (nodo.padre_id === null || nodo.padre_id === 0) {
            rootNodes.push(nodeMap[nodo.id]);
        } else if (nodeMap[nodo.padre_id]) {
            nodeMap[nodo.padre_id].children.push(nodeMap[nodo.id]);
        }
    });

    return {
        nodeData: {
            id: 'root',
            topic: mapa.titulo,
            children: rootNodes
        },
        linkData: {}
    };
}






export async function popupCrearNodo(mapaId, padreId, mindInstance) {
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
                const nodoCreado = await crearNodo(mapaId, contenido, null);

                if (nodoCreado && nodoCreado.nodo.id) {
                    // 🔄 Volver a obtener todos los nodos actualizados
                    const nodosActualizados = await fetchNodos(mapaId);
                    const mapa = await selectMindMap(mapaId);
                    const newTree = buildMindElixirTree(nodosActualizados, mapa);
                    mindInstance.nodeData = newTree.nodeData;
                    mindInstance.linkData = newTree.linkData;
                    socket.emit('crear-nodo', { mapaId: mapaId });

                    // 🔁 Actualizar el mindInstance
                    mindInstance.refresh(newTree);
                    // Emitir evento socket para avisar a otros


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

        if (nodoCreado && nodoCreado.nodo.id) {
            // 🔄 Volver a obtener todos los nodos actualizados
            const nodosActualizados = await fetchNodos(mapaId);
            const mapa = await selectMindMap(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);
            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('crear-nodo', { mapaId: mapaId });

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
        alert("Selecciona un nodo para crear su hermano.");
        return;
    }

    // Obtener el ID real del padre desde el atributo data-padreid
    const padreId = nodoActual.getAttribute('data-padreid'); // ya debería estar seteado en los atributos

    try {
        const nuevoNodo = await crearNodo(mapaId, "Nuevo hermano", padreId);

        if (nuevoNodo && nuevoNodo.nodo?.id) {
            const nodosActualizados = await fetchNodos(mapaId);
            const mapa = await selectMindMap(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);

            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('crear-nodo', { mapaId: mapaId });

            mindInstance.refresh(newTree);

        } else {
            alert("No se pudo crear el nodo hermano.");
        }
    } catch (error) {
        console.error("Error al crear nodo hermano:", error);
        alert("Hubo un error al crear el nodo hermano.");
    }
}



export async function crearHijoNodo(mapaId, mindInstance) {
    const nodoActual = mindInstance.currentNode;

    if (!nodoActual) {
        alert("Selecciona un nodo para crear un hijo.");
        return;
    }

    const selectedNode = mindInstance.currentNode;
    if (!selectedNode || !selectedNode.getAttribute) {
        showToast('Selecciona un nodo para crear un hijo.', 'error');
        return;
    }

    const fullId = selectedNode.getAttribute('data-nodeid'); // ej. "me125"
    const dbId = fullId.slice(2); // ej. "125"


    try {
        const mapa = await selectMindMap(mapaId);
        if (dbId == 'root') {
            const nuevoNodo = await crearNodo(mapaId, "Nuevo hijo", null);
            if (nuevoNodo && nuevoNodo.nodo?.id) {



                const nodosActualizados = await fetchNodos(mapaId);
                const newTree = buildMindElixirTree(nodosActualizados, mapa);

                mindInstance.nodeData = newTree.nodeData;
                mindInstance.linkData = newTree.linkData;
                socket.emit('crear-nodo', { mapaId: mapaId });

                mindInstance.refresh(newTree);

                // Pequeño delay para que Mind-Elixir actualice la vista
                await new Promise(resolve => setTimeout(resolve, 100));

                // Seleccionamos el nodo recién creado
                mindInstance.selectNode(nuevoNodo.nodo.id.toString());
            }
        } else {
            const nuevoNodo = await crearNodo(mapaId, "Nuevo hijo", dbId);
            if (nuevoNodo && nuevoNodo.nodo?.id) {



                const nodosActualizados = await fetchNodos(mapaId);
                const newTree = buildMindElixirTree(nodosActualizados, mapa);

                mindInstance.nodeData = newTree.nodeData;
                mindInstance.linkData = newTree.linkData;
                socket.emit('crear-nodo', { mapaId: mapaId });

                mindInstance.refresh(newTree);

                // Pequeño delay para que Mind-Elixir actualice la vista
                await new Promise(resolve => setTimeout(resolve, 100));

                // Seleccionamos el nodo recién creado
                mindInstance.selectNode(nuevoNodo.nodo.id.toString());
            }
        }





    } catch (error) {
        console.error("Error al crear nodo hijo:", error);
        alert("Hubo un error al crear el nodo hijo.");
    }
}


export async function crearPadreNodo(mapaId, mindInstance) {
    const nodoActual = mindInstance.currentNode;

    if (!nodoActual) {
        alert("Selecciona un nodo para crear un padre.");
        return;
    }

    const fullId = nodoActual.getAttribute('data-nodeid'); // ej. "me125"
    if (!fullId) {
        alert("Nodo seleccionado inválido.");
        return;
    }

    const dbId = fullId.slice(2); // ej. "125"

    try {
        // Llamamos al fetch que hace la petición al backend para crear el padre
        // Pasamos el mapaId, un topic por defecto, y el id del hijo
        const nuevoPadre = await fetchCrearPadre(mapaId, "Nuevo padre", dbId);

        if (nuevoPadre && nuevoPadre.id) {
            // Actualizamos el árbol con los nodos actuales
            const nodosActualizados = await fetchNodos(mapaId);
            const mapa = await selectMindMap(mapaId);
            const newTree = buildMindElixirTree(nodosActualizados, mapa);

            mindInstance.nodeData = newTree.nodeData;
            mindInstance.linkData = newTree.linkData;
            socket.emit('crear-nodo', { mapaId: mapaId });

            mindInstance.refresh(newTree);

            // Delay para que se actualice la vista
            await new Promise(resolve => setTimeout(resolve, 100));

            // Seleccionar el nuevo nodo padre creado
            mindInstance.selectNode(nuevoPadre.id.toString());

        } else {
            alert("No se pudo crear el nodo padre.");
        }

    } catch (error) {
        console.error("Error al crear nodo padre:", error);
        alert("Hubo un error al crear el nodo padre.");
    }
}


function renderAvatarGroup(usuarios, mapa) {
    const container = document.createElement('div');
    container.className = 'avatar-group';
    console.log(usuarios);

    usuarios.forEach(usuario => {
        const avatar = document.createElement('img');
        avatar.className = 'avatar-circle';
        avatar.src = usuario.avatar_url;
        avatar.title = usuario.email;
        avatar.alt = usuario.email;
        container.appendChild(avatar);
    });
    if (mapa.rol_mapa === 'admin') {
        container.addEventListener('click', () => {
            abrirPopupGestionUsuarios(mapa.id);

        });

    }




    return container;
}

export async function abrirPopupGestionUsuarios(mapId) {
    const usuarios = await getUsuariosDelMapa(mapId);
    const emailUsuario = localStorage.getItem('email');

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const content = document.createElement('div');
    content.className = 'popup-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'popup-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => overlay.remove());
    content.appendChild(closeBtn);


    usuarios.forEach(usuario => {
        const userRow = document.createElement('div');
        userRow.className = 'user-row';

        const avatar = document.createElement('img');
        avatar.className = 'avatar-circle';
        avatar.src = usuario.avatar_url;
        avatar.alt = usuario.nombre;

        const info = document.createElement('div');
        info.className = 'user-info';

        const nombre = document.createElement('strong');
        nombre.textContent = usuario.nombre;

        const email = document.createElement('div');
        email.textContent = usuario.email;

        info.appendChild(nombre);
        info.appendChild(email);

        const selectContainer = document.createElement('div');
        selectContainer.className = 'select-container';

        if (usuario.email === emailUsuario) {
            const tuLabel = document.createElement('span');
            tuLabel.className = 'label-tu';
            tuLabel.textContent = 'Tú';
            selectContainer.appendChild(tuLabel);
        } else {
            const select = document.createElement('select');
            select.className = 'select-rol';

            const optMiembro = document.createElement('option');
            optMiembro.value = 'miembro';
            optMiembro.textContent = 'Miembro';

            const optAdmin = document.createElement('option');
            optAdmin.value = 'admin';
            optAdmin.textContent = 'Administrador';

            select.appendChild(optMiembro);
            select.appendChild(optAdmin);

            // Set value según el rol actual
            select.value = usuario.rol;

            select.addEventListener('change', async () => {
                const nuevoRol = select.value;
                const result = await cambiarRolUsuarioMapa(mapId, usuario.id, nuevoRol);

                if (!result.success) {
                    // Si falla, restauramos el valor anterior
                    select.value = usuario.rol;
                    alert("Error al actualizar el rol");
                } else {
                    // Si va bien, actualizamos el rol en el objeto local (opcional)
                    usuario.rol = nuevoRol;
                }
            });

            selectContainer.appendChild(select);
        }

        userRow.appendChild(avatar);
        userRow.appendChild(info);
        userRow.appendChild(selectContainer);

        content.appendChild(userRow);
    });

    overlay.appendChild(content);
    document.body.appendChild(overlay);
}


// Función común para refrescar todo el árbol

