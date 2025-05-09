// Función para obtener las notificaciones
import page from "page";
import { showToast } from "../../public/js/validator/regex.js";
import { getToken } from "./auth.js";
import { socket } from "./socket.js";
export async function createInvitation(gmail, workspaceId, boardId, rolTablero) {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return null;
    }

    const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/invitation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        email: gmail,
        espacio_trabajo_id: workspaceId,
        tablero_id: boardId,
        rol_tablero: rolTablero
      }),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message || 'Error al crear la invitación', 'error');
      throw new Error(data.message || 'Error al crear la invitación');
    }

    const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/getIdByEmail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': "Bearer " + token,
      },
      body: JSON.stringify({ email: gmail }),
    });
    
    const dataId = await response.json();
    if (dataId.success) {
      console.log("El ID del usuario es:", dataId.usuario_id);
    } else {
      console.warn(dataId.message);
    }

    const emailDestinatario = gmail;  // El email del destinatario
    if (socket && socket.connected) {
      socket.emit("nueva-invitacion", {
        id: dataId.usuario_id,
        email: emailDestinatario,
        workspaceId,
        boardId,
        rolTablero
      });
    } else {
      console.warn('⚠️ Socket no conectado, no se pudo emitir la invitación.');
    }
    

    showToast('Invitación enviada correctamente', 'success');
    return data.token; // Puedes devolver el token si lo necesitas

  } catch (err) {
    console.error(err);
    showToast('Error al crear la invitación: ' + err.message, 'error');
    throw new Error('Error al crear la invitación: ' + err.message);
  }
}



export async function getInvitations() {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return null;
    }

    const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/getInvitations.php', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message || 'Error al obtener las invitaciones', 'error');
      throw new Error(data.message || 'Error al obtener las invitaciones');
    }

    return data.invitaciones; // Devuelve el array de invitaciones

  } catch (err) {
    console.error(err);
    showToast('Error al obtener las invitaciones: ' + err.message, 'error');
    throw new Error('Error al obtener las invitaciones: ' + err.message);
  }
}


export async function acceptInvitation(invitacionId) {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return null;
    }

    const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/acceptInvitation.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ invitacion_id: invitacionId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Error al aceptar la invitación:", data.message);
      showToast(data.message || "Hubo un problema al aceptar la invitación. Intenta nuevamente.", "error");
      return;
    }

    showToast(data.message, "success");
    page(page.current); // recarga la ruta actual
    /*if (data.tablero_id) {
      page(`/boards/${data.tablero_id}`);
    } else {
      showToast("No se ha recibido el ID del tablero", "error");
    }*/

  } catch (error) {
    console.error("Error de red o servidor:", error);
    showToast("Error de red o del servidor", "error");
  }
}


export async function denyInvitation(invitacionId) {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return null;
    }

    const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/denyInvitation.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ invitacion_id: invitacionId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Error al denegar la invitación:", data.message);
      showToast(data.message || "Hubo un problema al aceptar la invitación. Intenta nuevamente.", "error");
      return;
    }

    showToast(data.message, "info");
    /*if (data.tablero_id) {
      page(`/boards/${data.tablero_id}`);
    } else {
      showToast("No se ha recibido el ID del tablero", "error");
    }*/

  } catch (error) {
    console.error("Error de red o servidor:", error);
    showToast("Error de red o del servidor", "error");
  }
}
