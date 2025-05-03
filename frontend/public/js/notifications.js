// Función para obtener las notificaciones
import page from "page";
import { showToast } from "./validator/regex";
import { getToken } from "./auth";
export async function actualizarNotificaciones() {
  try {
    const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/invitation.php');
    const notificaciones = await response.json();
    const notifBadge = document.querySelector('.notif-badge');
    const notifList = document.querySelector('.notif-list');

    if (notificaciones.length > 0) {
      notifBadge.classList.remove('hidden');
      notifBadge.textContent = notificaciones.length;
      notifList.textContent = '';  // Limpiar las notificaciones previas

      notificaciones.forEach(notif => {
        const notifItem = crearNotificacion(notif.texto, notif.negrita, notif.cursiva, notif.icono);
        notifList.appendChild(notifItem);
      });
    } else {
      notifBadge.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error al cargar las notificaciones:', error);
  }
}

// Llamar a esta función cuando sea necesario
//actualizarNotificaciones();

export async function createInvitation(gmail, workspaceId, boardId, rolTablero) {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return;
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
    console.log('Respuesta del backend:', data);

    if (!data.success) {
      showToast(data.message || 'Error al crear la invitación', 'error');
      throw new Error(data.message || 'Error al crear la invitación');
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
      return;
    }

    const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/getInvitations.php', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    console.log('Invitaciones recibidas:', data);

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
      return;
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

    console.log("Invitación aceptada correctamente:", data.message);
    showToast(data.message, "success");
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
