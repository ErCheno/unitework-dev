// socket.js (frontend)
import { io } from "socket.io-client";
import { getToken } from "./auth.js";
import { socketGetInvitations, socketGetWorkspaces } from "./socketsEvents.js";
import { showToast } from "../../public/js/validator/regex.js";
import { cargarInvitaciones } from "../components/topbar.js";

export let socket;

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
      //console.log('ENTREEEEE')
      console.log('📨 Invitación recibida:', data);
      showToast(`📨 Nueva invitación de ${data.nombre || 'alguien'}`, "info");

      const badge = document.querySelector('.notif-badge');
      const list = document.querySelector('.notif-list');
      if (badge && list) {
        await cargarInvitaciones(list, badge);
      }
    });
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.emit('customDisconnect');
    socket.disconnect();
  }
}
