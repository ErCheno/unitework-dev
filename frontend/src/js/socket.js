// socket.js (frontend)
import { io } from "socket.io-client";
import { getToken } from "./auth.js";
import { socketGetInvitations, socketGetWorkspaces } from "./socketsEvents.js";
import { showToast } from "../../public/js/validator/regex.js";
import { cargarInvitaciones } from "../components/topbar.js";
import { fetchAndRenderList, fetchAndRenderTasks } from "../pages/boardPage.js";
import { fetchNodos, selectMindMap } from "./mindMap.js";
import { buildMindElixirTree } from "../pages/mindMapPage.js";

export let socket;

export let instanciaMapaMental = null;

export function inicializarSocketListeners(mindInstance) {
    instanciaMapaMental = mindInstance;

    socket.on('crear-nodo', ({ mapaId }) => {
        console.log('Nodo creado en mapa', mapaId);
        refrescarMapaMental(mapaId);
    });

    socket.on('modificar-nodo', ({ mapaId }) => {
        console.log('Nodo modificado en mapa', mapaId);
        refrescarMapaMental(mapaId);
    });

    socket.on('eliminar-nodo', ({ mapaId }) => {
        console.log('Nodo eliminado en mapa', mapaId);
        refrescarMapaMental(mapaId);
    });
}

export function connectSocket() {
  const token = getToken();
  if (!token) {
    console.warn('No se encontró el token aún. Esperando login.');
    return;
  }

  if (!socket || !socket.connected) {
    socket = io("http://localhost:3001", {
      transports: ['websocket'],
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al WebSocket:', socket.id);
      socketGetWorkspaces();
      socketGetInvitations();

    });

    socket.on('disconnect', () => {
      console.log('🔌 Desconectado del WebSocket');
    });

    socket.on('nueva-invitacion', async (data) => {
      console.log('📨 Invitación recibida:', data);
      showToast(`📨 Nueva invitación de ${data.nombre || 'alguien'}`, "info");

      const badge = document.querySelector('.notif-badge');
      const list = document.querySelector('.notif-list');
      if (badge && list) {
        await cargarInvitaciones(list, badge);
      }
    });
    socket.on('mover-tarea', (data) => {
      console.log('📨 Tarea movida por otro usuario:', data);

      data.nuevoOrden.forEach(({ id }) => {
        // Crear el objeto estado con tablero_id y id
        const estadoActualizado = {
          id: parseInt(id),
          tablero_id: data.estado.tablero_id,
          // Puedes pasar color y nombre también si los necesitas más adelante
          color: data.estado.color,
          nombre: data.estado.nombre
        };

        // Renderizamos la columna que ha cambiado
        fetchAndRenderTasks(estadoActualizado);
      });
    });
    socket.on('crear-lista', (boardId) => {
      fetchAndRenderList(boardId);
    });
    socket.on('crear-tarea', (estado) => {
      fetchAndRenderTasks(estado);
    });
    socket.on('eliminar-lista', (boardId) => {
      fetchAndRenderList(boardId);
    });
    socket.on('eliminar-tarea', (estado) => {
      fetchAndRenderTasks(estado);
    });

    socket.on('modificar-lista', (data) => {
      const estadoActualizado = {
        id: parseInt(data.estado.id),
        tablero_id: parseInt(data.estado.tablero_id),
        color: data.estado.color,
        nombre: data.estado.nombre
      };

      console.log('📝 Lista modificada por otro usuario:', estadoActualizado);

      fetchAndRenderList(estadoActualizado); // Puedes adaptar esto si necesitas refrescar solo una columna
    });

    async function actualizarMapaCompleto(mapaId, mindInstance) {
      try {
        const nodos = await fetchNodos(mapaId);
        const mapa = await selectMindMap(mapaId);
        const newTree = buildMindElixirTree(nodos, mapa);
        mindInstance.nodeData = newTree.nodeData;
        mindInstance.linkData = newTree.linkData;
        mindInstance.refresh(newTree);
      } catch (error) {
        console.error("Error actualizando mapa mental por socket:", error);
      }
    }

  }
}

export function disconnectSocket() {
  if (socket) {
    socket.emit('customDisconnect');
    socket.disconnect();
  }
}


export async function refrescarMapaMental(mapaId) {
    if (!instanciaMapaMental) {
        console.error('⚠️ mindInstance aún no está definida');
        return;
    }
    if (!mapaId) {
        console.error('⚠️ No se recibió mapaId válido para refrescar');
        return;
    }
    try {
        console.log('Refrescando mapa mental con mapaId:', mapaId);
        const nodosActualizados = await fetchNodos(mapaId);
        const mapa = await selectMindMap(mapaId);
        const newTree = buildMindElixirTree(nodosActualizados, mapa);

        instanciaMapaMental.nodeData = newTree.nodeData;
        instanciaMapaMental.linkData = newTree.linkData;
        instanciaMapaMental.refresh(newTree);
    } catch (error) {
        console.error('Error actualizando mapa mental:', error);
    }
}
