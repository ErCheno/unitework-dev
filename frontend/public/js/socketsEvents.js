import { socket } from './socket.js';
import { fetchWorkspaces } from './workspaces.js';
import { renderWorkspaces } from '../../src/pages/myworkspacesPage.js'; // o donde tengas la función de renderizado
import { getInvitations } from './notifications.js';

export function socketGetWorkspaces() {
    socket.on('getWorkspaces', async () => {
        await fetchWorkspaces();
    });
}


export async function socketGetInvitations() {
    socket.on('recibir-invitacion', async () => {
        showToast("Tienes una nueva invitación", "info");
        const invitations = await getInvitations();

    });
}