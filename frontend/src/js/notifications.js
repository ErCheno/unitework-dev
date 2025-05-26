// Función para obtener las notificaciones
import page from "page";
import { showToast } from "../../public/js/validator/regex.js";
import { eliminarToken, getToken } from "./auth.js";
import { socket } from "./socket.js";
import { logoutUser } from "../pages/loginPage.js";
export async function createInvitation(gmail, workspaceId, tipo, idRelacionado, rol) {
  try {
    const token = getToken();

    if (!token) {
      showToast("Token no disponible. Inicia sesión nuevamente.", "error");
      page("/login");
      return null;
    }

    const payload = {
      email: gmail,
      espacio_trabajo_id: workspaceId,
      tipo: tipo, // 'kanban' o 'mapa'
      rol: rol
    };

    // Añadir el identificador correspondiente según el tipo
    if (tipo === "kanban") {
      payload.tablero_id = idRelacionado;
    } else if (tipo === "mapa_mental") {
      payload.mapa_id = idRelacionado;
      console.log("Mapa ID en payload:", payload.mapa_id);
    }

    console.log(payload);

    const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/invitation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message || 'Error al crear la invitación', 'error');
      throw new Error(data.message || 'Error al crear la invitación');
    }

    // Intentar obtener el ID del usuario por su email
    let usuarioId = null;
    try {
      const resId = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/getIdByEmail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({ email: gmail }),
      });

      const dataId = await resId.json();
      if (dataId.success) {
        usuarioId = dataId.usuario_id;
        console.log("El ID del usuario es:", usuarioId);
      } else {
        console.warn("No se encontró el ID del usuario:", dataId.message);
      }
    } catch (err) {
      console.warn("Error al obtener el ID del usuario:", err);
    }

    // Emitir evento por socket si el usuario está registrado
    if (usuarioId && socket && socket.connected) {
      socket.emit("nueva-invitacion", {
        id: usuarioId,
        email: gmail,
        workspaceId,
        tipo,
        idRelacionado, // tablero o mapa
        rol
      });
    } else {
      console.warn('⚠️ Socket no conectado o usuario no registrado, no se pudo emitir la invitación.');
    }

    showToast('Invitación enviada correctamente', 'success');
    return data.token;

  } catch (err) {
    console.error(err);
    showToast('Error al crear la invitación: ' + err.message, 'error');
    throw new Error('Error al crear la invitación: ' + err.message);
  }
}

export async function getInvitations() {
  const token = getToken();

  if (!token) {
    showToast("Token no disponible. Inicia sesión nuevamente.", "error");
    logoutUser();

    return null;
  }

  try {
    const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/invitation/getInvitations.php', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // Error HTTP (por ejemplo, 401, 500)
      throw new Error(`Error del servidor: ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      // Error lógico del backend
      showToast(data.message || 'Error al obtener las invitaciones', 'error');
      return null;
    }

    return data.invitaciones;

  } catch (err) {
    console.error("Error al obtener las invitaciones:", err);
    showToast('Error al obtener las invitaciones: ' + err.message, 'error');


    return null;
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
