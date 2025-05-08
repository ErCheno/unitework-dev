import { connectSocket, socket } from './socket.js';
import { fetchWorkspaces } from './workspaces.js';
import { renderWorkspaces } from '../pages/myworkspacesPage.js'; // o donde tengas la función de renderizado
import { getInvitations } from './notifications.js';
import { cargarInvitaciones } from '../components/topbar.js';
import { showToast } from '../../public/js/validator/regex.js';



export function socketGetWorkspaces() {
    if (socket) {  // Verifica si el socket ya está conectado
        socket.on('getWorkspaces', async () => {
            await fetchWorkspaces();
        });
    } else {
        console.error('El socket aún no está conectado');
    }
}

export function socketGetInvitations() {
    if (socket && socket.connected) {
        socket.off('nueva-invitacion'); // Evita duplicados
        socket.on('nueva-invitacion', async (data) => {
            console.log('📨 Invitación recibida vía socket:', data);

            showToast(`📨 Nueva invitación de ${data.deNombre || 'un usuario'}`, "info");

            const badge = document.querySelector('.notif-badge');
            const list = document.querySelector('.notif-list');
            if (badge && list) {
                await cargarInvitaciones(list, badge);
            }
        });
    } else {
        console.error('El socket aún no está conectado');
    }
}

     /* const li = crearNotificacion(
        'Te han invitado a un tablero',
        nombreRemitente,
        `(${nombre_tablero} en ${nombre_espacio_trabajo})`,
        'fa-solid fa-envelope-open-text',
        'invitacion',
        avatarRemitente,
        aceptar,
        rechazar
      );*/