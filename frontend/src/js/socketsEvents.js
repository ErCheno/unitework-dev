import { connectSocket, socket } from './socket.js';
import { fetchWorkspaces } from './workspaces.js';
import { renderWorkspaces } from '../pages/myworkspacesPage.js'; // o donde tengas la función de renderizado
import { getInvitations } from './notifications.js';
import { cargarInvitaciones } from '../components/topbar.js';
import { showToast } from '../../public/js/validator/regex.js';
import { moverTareas } from './task.js';
import { fetchAndRenderList, fetchAndRenderTasks } from '../pages/boardPage.js';
import { setupSortableKanban } from '../components/dragAnimation.js';
import { setupSortableList } from '../components/dragAnimation.js';



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

/*export function socketMoveTask(estado) {
    socket.on('mover-tarea', (data) => {
        console.log(data.estado.id);
        console.log(estado.id);


        console.log('📨 Tarea movida por otro usuario:', data);
        if (data.estado.id !== estado.id) return;
        fetchAndRenderTasks(estado);
    });

}*/

export function socketMoveList(boardId) {
    socket.on('mover-lista', (data) => {
        if (data.boardId !== boardId) return; // Ignorar si es otro tablero

        console.log('Lista movida por otro usuario:', data);

        // Aquí puedes refrescar la lista de columnas (o actualizar visualmente)
        fetchAndRenderList(boardId);
    });
}


export function socketPutList(boardId) {
    //socket.off('modificar-lista'); // elimina cualquier handler anterior

    socket.on('modificar-lista', (data) => {
        if (data.tablero_id !== boardId) return;

        console.log('📝 Lista modificada por otro usuario:', data);

        fetchAndRenderList(boardId); // refresca el tablero actual
    });
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